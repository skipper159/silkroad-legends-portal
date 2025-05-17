-- Neue Spalten zur WebUsers-Tabelle hinzufügen
ALTER TABLE WebUsers
ADD EmailVerified BIT DEFAULT 0 NOT NULL;

ALTER TABLE WebUsers
ADD VerificationToken NVARCHAR(255) NULL;

ALTER TABLE WebUsers
ADD VerificationTokenExpiry DATETIME NULL;

ALTER TABLE WebUsers
ADD ResetPasswordToken NVARCHAR(255) NULL;

ALTER TABLE WebUsers
ADD ResetPasswordTokenExpiry DATETIME NULL;

-- Index für schnellere Suche nach Tokens - ohne WHERE-Klausel
CREATE INDEX IX_WebUsers_VerificationToken ON WebUsers(VerificationToken);
CREATE INDEX IX_WebUsers_ResetPasswordToken ON WebUsers(ResetPasswordToken);
