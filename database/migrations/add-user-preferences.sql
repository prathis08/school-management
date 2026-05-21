-- Migration: Create user_preferences table
-- Description: Stores per-user appearance preferences (theme, primary color,
--              sidebar style, language) for the Settings > Appearance tab.
-- Created for: Settings module (backend-core)

-- NOTE: users.id is not enforced as a primary key in this database, so we
-- cannot declare a foreign key that references it. The FK is still modeled
-- at the application (Sequelize) layer in UserPreferences.
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL UNIQUE,
  theme         character varying(20)  NOT NULL DEFAULT 'light',
  primary_color character varying(20)  NOT NULL DEFAULT '#3B82F6',
  sidebar_style character varying(20)  NOT NULL DEFAULT 'expanded',
  language      character varying(10)  NOT NULL DEFAULT 'en',
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  updated_at    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_theme_check
    CHECK (theme IN ('light', 'dark', 'auto')),
  CONSTRAINT user_preferences_sidebar_style_check
    CHECK (sidebar_style IN ('expanded', 'collapsed', 'mini'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);

COMMENT ON TABLE  public.user_preferences                  IS 'Per-user appearance settings';
COMMENT ON COLUMN public.user_preferences.theme            IS 'light | dark | auto';
COMMENT ON COLUMN public.user_preferences.primary_color    IS 'Hex color string, e.g. #3B82F6';
COMMENT ON COLUMN public.user_preferences.sidebar_style    IS 'expanded | collapsed | mini';
COMMENT ON COLUMN public.user_preferences.language         IS 'ISO language code (e.g. en, es)';

-- Rollback
-- DROP INDEX IF EXISTS idx_user_preferences_user_id;
-- DROP TABLE IF EXISTS public.user_preferences;
