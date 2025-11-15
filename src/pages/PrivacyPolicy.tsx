import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Cookie, Lock, Eye, FileText, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-grow'>
        <div className='container mx-auto px-4 py-16 max-w-4xl'>
          {/* Header */}
          <div className='text-center mb-12'>
            <div className='inline-flex items-center justify-center p-4 bg-lafftale-gold/10 rounded-full mb-6'>
              <Shield className='text-lafftale-gold' size={48} />
            </div>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>Datenschutzerklärung</h1>
            <p className='text-gray-400 text-lg'>Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}</p>
          </div>

          {/* Content */}
          <div className='space-y-8 text-gray-300'>
            {/* Section 1: Verantwortlicher */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <FileText className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>1. Verantwortlicher</h2>
              </div>
              <p className='mb-3'>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
              <div className='bg-gray-900/50 p-4 rounded border border-gray-700'>
                <p className='font-semibold text-white'>Lafftale Gaming</p>
                <p>Musterstraße 123</p>
                <p>12345 Musterstadt</p>
                <p className='mt-2'>
                  E-Mail:{' '}
                  <a href='mailto:privacy@lafftale.com' className='text-lafftale-gold hover:underline'>
                    privacy@lafftale.com
                  </a>
                </p>
              </div>
            </section>

            {/* Section 2: Datenerfassung */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Eye className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>2. Welche Daten erfassen wir?</h2>
              </div>

              <h3 className='text-xl font-semibold text-white mb-3'>2.1 Personenbezogene Daten</h3>
              <p className='mb-4'>Bei der Registrierung und Nutzung unserer Dienste erheben wir folgende Daten:</p>
              <ul className='list-disc list-inside space-y-2 mb-4 ml-4'>
                <li>Benutzername und E-Mail-Adresse</li>
                <li>Passwort (verschlüsselt gespeichert)</li>
                <li>IP-Adresse und Zeitstempel der Registrierung</li>
                <li>Spielaktivitäten und Charakterdaten</li>
                <li>Kommunikation mit dem Support</li>
              </ul>

              <h3 className='text-xl font-semibold text-white mb-3'>2.2 Automatisch erfasste Daten</h3>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>Browser-Typ und -Version</li>
                <li>Betriebssystem</li>
                <li>Referrer-URL (zuvor besuchte Seite)</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
              </ul>
            </section>

            {/* Section 3: Cookies */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Cookie className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>3. Verwendung von Cookies</h2>
              </div>

              <p className='mb-4'>
                Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert
                werden.
              </p>

              <div className='space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold text-white mb-2'>3.1 Essentielle Cookies</h3>
                  <p className='text-sm'>
                    Diese Cookies sind für den Betrieb der Website unerlässlich und können nicht deaktiviert werden. Sie
                    umfassen Session-Management und Sicherheitsfunktionen.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-white mb-2'>3.2 Funktionale Cookies</h3>
                  <p className='text-sm'>
                    Diese Cookies ermöglichen erweiterte Funktionen wie Spracheinstellungen und Benutzerpräferenzen.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-white mb-2'>3.3 Analyse-Cookies</h3>
                  <p className='text-sm'>
                    Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem
                    Informationen anonym gesammelt werden.
                  </p>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-white mb-2'>3.4 Marketing-Cookies</h3>
                  <p className='text-sm'>
                    Diese Cookies werden verwendet, um Werbung relevanter für Sie und Ihre Interessen zu machen.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Rechtsgrundlage */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Lock className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>4. Rechtsgrundlage der Verarbeitung</h2>
              </div>
              <p className='mb-3'>Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von:</p>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>
                  <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> - Einwilligung für Cookies und Newsletter
                </li>
                <li>
                  <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> - Vertragserfüllung (Spielkonto)
                </li>
                <li>
                  <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> - Berechtigtes Interesse (Sicherheit, Betrug)
                </li>
              </ul>
            </section>

            {/* Section 5: Ihre Rechte */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Shield className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>5. Ihre Rechte nach DSGVO</h2>
              </div>
              <p className='mb-3'>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>
                  <strong>Recht auf Auskunft</strong> (Art. 15 DSGVO)
                </li>
                <li>
                  <strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)
                </li>
                <li>
                  <strong>Recht auf Löschung</strong> (Art. 17 DSGVO)
                </li>
                <li>
                  <strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)
                </li>
                <li>
                  <strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)
                </li>
                <li>
                  <strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)
                </li>
                <li>
                  <strong>Recht auf Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)
                </li>
              </ul>
            </section>

            {/* Section 6: Datensicherheit */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Lock className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>6. Datensicherheit</h2>
              </div>
              <p className='mb-3'>
                Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten gegen
                zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder gegen den Zugriff unberechtigter
                Personen zu schützen:
              </p>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                <li>Verschlüsselte Speicherung von Passwörtern (bcrypt)</li>
                <li>Regelmäßige Sicherheitsupdates und Backups</li>
                <li>Zugriffsbeschränkungen und Authentifizierung</li>
                <li>Firewalls und Intrusion Detection Systeme</li>
              </ul>
            </section>

            {/* Section 7: Speicherdauer */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <FileText className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>7. Speicherdauer</h2>
              </div>
              <p className='mb-3'>Wir speichern Ihre personenbezogenen Daten nur so lange, wie:</p>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>Dies für die Erfüllung der Zwecke erforderlich ist</li>
                <li>Sie Ihr Spielkonto aktiv nutzen</li>
                <li>Gesetzliche Aufbewahrungsfristen bestehen</li>
                <li>Zur Geltendmachung oder Verteidigung von Rechtsansprüchen erforderlich</li>
              </ul>
              <p className='mt-3'>
                Inaktive Accounts werden nach 2 Jahren automatisch gelöscht, sofern keine gesetzlichen
                Aufbewahrungspflichten bestehen.
              </p>
            </section>

            {/* Section 8: Drittanbieter */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Eye className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>8. Weitergabe an Dritte</h2>
              </div>
              <p className='mb-3'>Eine Übermittlung Ihrer Daten an Dritte erfolgt nur, wenn:</p>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>Sie ausdrücklich eingewilligt haben (Art. 6 Abs. 1 lit. a DSGVO)</li>
                <li>Dies zur Vertragserfüllung erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Eine gesetzliche Verpflichtung besteht (Art. 6 Abs. 1 lit. c DSGVO)</li>
                <li>Dies zur Wahrung berechtigter Interessen erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO)</li>
              </ul>
            </section>

            {/* Section 9: Kontakt */}
            <section className='bg-gradient-to-br from-lafftale-gold/10 to-lafftale-bronze/10 border border-lafftale-gold/30 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Mail className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>9. Kontakt & Beschwerden</h2>
              </div>
              <p className='mb-3'>
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte:
              </p>
              <div className='bg-gray-900/50 p-4 rounded border border-gray-700'>
                <p className='font-semibold text-white mb-2'>Datenschutzbeauftragter</p>
                <p>
                  E-Mail:{' '}
                  <a href='mailto:privacy@lafftale.com' className='text-lafftale-gold hover:underline'>
                    privacy@lafftale.com
                  </a>
                </p>
              </div>
              <p className='mt-4 text-sm'>
                Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde über die Verarbeitung Ihrer
                personenbezogenen Daten durch uns zu beschweren.
              </p>
            </section>

            {/* Section 10: Änderungen */}
            <section className='bg-gray-800/50 border border-lafftale-gold/20 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <FileText className='text-lafftale-gold' size={24} />
                <h2 className='text-2xl font-bold text-white'>10. Änderungen dieser Datenschutzerklärung</h2>
              </div>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen
                Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch
                gilt dann die neue Datenschutzerklärung.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
