-- Insight Refinery 数据库表结构
-- 创建时间: 2025-09-07

-- 讨论会话表
CREATE TABLE IF NOT EXISTS discussion_sessions (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER NOT NULL DEFAULT 0,
    key_insights_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 对话记录表
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_question TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_key_insight BOOLEAN NOT NULL DEFAULT FALSE,
    insight_category TEXT CHECK (insight_category IN ('financial', 'strategic', 'market', 'risk', 'opportunity')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (session_id) REFERENCES discussion_sessions(id) ON DELETE CASCADE
);

-- 关键洞察表
CREATE TABLE IF NOT EXISTS key_insights (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    source_conversation_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (session_id) REFERENCES discussion_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (source_conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- 洞察合成表
CREATE TABLE IF NOT EXISTS insight_synthesis (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    discussion_summary TEXT NOT NULL,
    key_questions_raised TEXT[] NOT NULL DEFAULT '{}',
    new_perspectives TEXT[] NOT NULL DEFAULT '{}',
    missing_information_gaps TEXT[] NOT NULL DEFAULT '{}',
    synthesis_prompt TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (session_id) REFERENCES discussion_sessions(id) ON DELETE CASCADE
);

-- 报告进化表 (扩展reports表)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_insight_refinery_enhanced BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS parent_report_id TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS generation_cost DECIMAL(10,2) DEFAULT 0;

-- 添加外键约束
ALTER TABLE reports ADD CONSTRAINT fk_parent_report 
    FOREIGN KEY (parent_report_id) REFERENCES reports(id) ON DELETE SET NULL;

-- 变更追踪表
CREATE TABLE IF NOT EXISTS change_tracking (
    id TEXT PRIMARY KEY,
    original_report_id TEXT NOT NULL,
    evolved_report_id TEXT NOT NULL,
    diff_summary TEXT NOT NULL,
    highlighted_changes JSONB NOT NULL DEFAULT '[]',
    evolution_type TEXT NOT NULL CHECK (evolution_type IN ('insight_refinery', 'manual_update', 'data_refresh')),
    similarity_score DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (similarity_score >= 0 AND similarity_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (original_report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (evolved_report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- 报告文件夹表
CREATE TABLE IF NOT EXISTS report_folders (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    original_report_id TEXT NOT NULL,
    latest_version_id TEXT NOT NULL,
    total_versions INTEGER NOT NULL DEFAULT 1,
    total_discussions INTEGER NOT NULL DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (original_report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (latest_version_id) REFERENCES reports(id) ON DELETE CASCADE,
    
    UNIQUE(company_name, ticker)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_discussion_sessions_user_id ON discussion_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_sessions_report_id ON discussion_sessions(report_id);
CREATE INDEX IF NOT EXISTS idx_discussion_sessions_status ON discussion_sessions(status);
CREATE INDEX IF NOT EXISTS idx_discussion_sessions_created_at ON discussion_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_key_insight ON conversations(is_key_insight);

CREATE INDEX IF NOT EXISTS idx_key_insights_session_id ON key_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_key_insights_category ON key_insights(category);

CREATE INDEX IF NOT EXISTS idx_insight_synthesis_session_id ON insight_synthesis(session_id);
CREATE INDEX IF NOT EXISTS idx_insight_synthesis_created_at ON insight_synthesis(created_at);

CREATE INDEX IF NOT EXISTS idx_reports_parent_id ON reports(parent_report_id);
CREATE INDEX IF NOT EXISTS idx_reports_insight_refinery ON reports(is_insight_refinery_enhanced);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

CREATE INDEX IF NOT EXISTS idx_change_tracking_original ON change_tracking(original_report_id);
CREATE INDEX IF NOT EXISTS idx_change_tracking_evolved ON change_tracking(evolved_report_id);
CREATE INDEX IF NOT EXISTS idx_change_tracking_type ON change_tracking(evolution_type);

CREATE INDEX IF NOT EXISTS idx_report_folders_company ON report_folders(company_name);
CREATE INDEX IF NOT EXISTS idx_report_folders_ticker ON report_folders(ticker);
CREATE INDEX IF NOT EXISTS idx_report_folders_last_activity ON report_folders(last_activity);

-- 创建触发器以自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discussion_sessions_updated_at 
    BEFORE UPDATE ON discussion_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_folders_updated_at 
    BEFORE UPDATE ON report_folders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建视图以简化查询
CREATE OR REPLACE VIEW report_evolution_timeline AS
SELECT 
    r.id,
    r.title,
    r.company_name,
    r.ticker,
    r.is_insight_refinery_enhanced,
    r.parent_report_id,
    r.created_at,
    rf.id as folder_id,
    rf.total_versions,
    CASE 
        WHEN r.parent_report_id IS NULL THEN 'Original'
        WHEN r.is_insight_refinery_enhanced THEN 'Insight Refinery Enhanced'
        ELSE 'Manual Update'
    END as evolution_type
FROM reports r
LEFT JOIN report_folders rf ON r.id = rf.latest_version_id OR r.parent_report_id = rf.original_report_id
ORDER BY r.created_at DESC;

CREATE OR REPLACE VIEW discussion_insights_summary AS
SELECT 
    ds.id as session_id,
    ds.report_id,
    ds.user_id,
    ds.total_questions,
    ds.key_insights_count,
    ds.status,
    ds.session_start,
    ds.session_end,
    COUNT(c.id) as total_conversations,
    COUNT(CASE WHEN c.is_key_insight THEN 1 END) as actual_key_insights,
    is.id as synthesis_id,
    is.discussion_summary,
    is.created_at as synthesis_created_at
FROM discussion_sessions ds
LEFT JOIN conversations c ON ds.id = c.session_id
LEFT JOIN insight_synthesis is ON ds.id = is.session_id
GROUP BY ds.id, ds.report_id, ds.user_id, ds.total_questions, ds.key_insights_count, 
         ds.status, ds.session_start, ds.session_end, is.id, is.discussion_summary, is.created_at
ORDER BY ds.session_start DESC;



