-- Referral Rewards Tabelle für spezielle Belohnungen
CREATE TABLE referral_rewards (
    id int IDENTITY(1,1) PRIMARY KEY,
    points_required int NOT NULL,
    silk_reward int NOT NULL DEFAULT 0,
    item_id int NULL,
    description nvarchar(500) NOT NULL,
    is_active bit NOT NULL DEFAULT 1,
    created_at datetime2 DEFAULT GETDATE(),
    updated_at datetime2 DEFAULT GETDATE()
);

-- Standard-Belohnungen einfügen
INSERT INTO referral_rewards (points_required, silk_reward, item_id, description, is_active) VALUES
(100, 100, NULL, '100 Silk für 100 Punkte', 1),
(250, 300, NULL, '300 Silk für 250 Punkte (Bonus!)', 1),
(500, 750, NULL, '750 Silk für 500 Punkte (Super Bonus!)', 1),
(1000, 2000, NULL, '2000 Silk für 1000 Punkte (Mega Bonus!)', 1);

-- Index für bessere Performance bei Abfragen nach Punkten
CREATE INDEX IX_referral_rewards_points_required ON referral_rewards (points_required);
CREATE INDEX IX_referral_rewards_is_active ON referral_rewards (is_active);