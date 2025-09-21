-- Referral Settings Tabelle
CREATE TABLE referral_settings (
    id int IDENTITY(1,1) PRIMARY KEY,
    setting_key nvarchar(50) NOT NULL UNIQUE,
    setting_value nvarchar(255) NOT NULL,
    description nvarchar(500),
    created_at datetime2 DEFAULT GETDATE(),
    updated_at datetime2 DEFAULT GETDATE()
);

-- Standard-Einstellungen einfügen
INSERT INTO referral_settings (setting_key, setting_value, description) VALUES
('points_per_referral', '100', 'Punkte die pro erfolgreichem Referral vergeben werden'),
('minimum_redeem_points', '100', 'Mindestanzahl Punkte die für eine Einlösung erforderlich sind'),
('silk_per_point', '1', 'Wieviel Silk pro Punkt beim Einlösen vergeben wird'),
('referral_enabled', 'true', 'Ob das Referral-System aktiviert ist');