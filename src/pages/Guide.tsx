import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Guide = () => {
  return (
    <>
      <Navbar />
      
      <div className="py-12 bg-header-bg bg-cover bg-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Silkroad Online (iSRO) – Vollständiger Game‑Guide
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 text-muted-foreground">
            Strukturiert, praxisnah und mit visuellen Hilfen. Dieser Guide deckt alle wichtigen Aspekte des Spiels ab.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inhaltsverzeichnis</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="#intro" className="btn-outline text-center">1. Einführung</a>
              <a href="#start" className="btn-outline text-center">2. Einstieg & Charaktere</a>
              <a href="#leveling" className="btn-outline text-center">3. Level‑Routen (1–40)</a>
              <a href="#job" className="btn-outline text-center">4. Job‑System</a>
              <a href="#alchemy" className="btn-outline text-center">5. Alchemy‑System</a>
              <a href="#crafting" className="btn-outline text-center">6. Crafting/Manufacturing</a>
              <a href="#fortress" className="btn-outline text-center">7. Fortress War</a>
              <a href="#dungeons" className="btn-outline text-center">8. Dungeons & Forgotten World</a>
              <a href="#economy" className="btn-outline text-center">9. Wirtschaft & Handel</a>
              <a href="#tips" className="btn-outline text-center">10. Tipps & Ressourcen</a>
            </nav>
          </CardContent>
        </Card>

        {/* Section 1: Einführung */}
        <section id="intro" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">1. Einführung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    <strong>Silkroad Online</strong> ist ein klassisches MMORPG von Joymax, berühmt für das{' '}
                    <em>Triangular Conflict</em> zwischen <strong>Trader</strong>, <strong>Hunter</strong> und{' '}
                    <strong>Thief</strong> (PvP‑Ökonomie) sowie für das Gilden‑Endgame <strong>Fortress War</strong>. 
                    Die Welt spannt sich von China über Zentralasien bis nach Europa.
                  </p>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                    <p className="text-sm">
                      <strong>Historisch:</strong> Das Spiel fokussiert thematisch die Handelsrouten der historischen{' '}
                      <em>Seidenstraße</em> – Städte, Karawanen und Banditen inklusive.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">F2P</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">PvE + PvP</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Karawanen</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Gildenkriege</span>
                  </div>
                </div>
                <div>
                  <img 
                    src="https://static.wikia.nocookie.net/silkroad/images/c/c0/Silkroad_World_Map3.jpg/revision/latest/scale-to-width-down/1200" 
                    alt="Weltkarte von Silkroad Online"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Weltkarte (Quelle: Silkroad Online Wiki / Fandom)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Einstieg & Charaktere */}
        <section id="start" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">2. Einstieg & Charaktere</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">China vs. Europe (kurz & ehrlich)</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>China</strong>: Solide Solo‑Klassen, einfache Potion‑Rotation, starke 1v1‑Skalierung, flexible Hybrid‑Builds.</li>
                  <li><strong>Europe</strong>: Party‑stark (Buff‑Synergien), klare Rollen (z. B. Wizard/Cleric, Warrior/Cleric), im Solo etwas anspruchsvoller.</li>
                </ul>
                <p className="mt-3"><strong>Empfehlung für Neulinge:</strong> CH Glavie (STR) oder EU Warrior/Cleric – verzeihen Fehler, farmen stabil.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Erste Schritte</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Main‑Story & City‑Quests mitnehmen (zusätzliche EXP + Gold).</li>
                    <li>Auto‑Potion sauber einstellen (HP/MP‑Schwellen, Return Scrolls parat).</li>
                    <li>Gear <em>schrittweise</em> upgraden – keine teuren Himmelfahrtskommandos früh.</li>
                  </ol>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Qualitäts‑of‑Life</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Greif/Transport‑Pets nutzen (Loot‑Komfort, Traglast).</li>
                    <li>Stall‑Netzwerk beobachten (Preisgefühl entwickeln).</li>
                    <li>Gilde suchen – für Buffs, Fortress & Karawanen.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Leveling */}
        <section id="leveling" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">3. Level‑Routen (1–40)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Bewährte Jagdgebiete</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>1–10</strong>: Startzonen um <em>Jangan</em>/<em>Constantinople</em></li>
                    <li><strong>10–20</strong>: Bandits/Hyongchas (Donwhang‑Umfeld)</li>
                    <li><strong>20–30</strong>: Ongs / Penons – dichtes Spawn, gutes EXP/HP‑Verhältnis</li>
                    <li><strong>30–40</strong>: Sonkar/Isy‑Gebiete (vorsichtig), Hyeongcheons, Earth Ghosts</li>
                  </ul>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                    <p className="text-sm">Solo → Fokus auf dichte Spawnfelder. In Party → Wizard/Cleric‑Train rockt Spots sehr effizient.</p>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Ausrüstung</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>NPC‑Gear nur als <em>Zwischenlösung</em>; besser: Drops & günstige +3/+4 im Stall</li>
                    <li>Waffen priorisieren (DPS skaliert EXP/h am stärksten)</li>
                    <li>Blues: <em>Durability</em>, <em>Attack/Parry</em>, situativ <em>STR/INT</em></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Job System */}
        <section id="job" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">4. Job‑System (Trader • Hunter • Thief)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Ab Level 20 wählst du frei eine Rolle: <strong>Trader</strong> (Waren transportieren),{' '}
                    <strong>Hunter</strong> (beschützen) oder <strong>Thief</strong> (überfallen). Sterne‑Waren (1–5★) 
                    → mehr Profit, aber stärkere NPC‑/Spieler‑Thieves.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Trader:</strong> Kauft Spezialwaren, nutzt Transport (Esel/Kamel/Ochse etc.)</li>
                    <li><strong>Hunter:</strong> Schließt sich Tradern an, jagt Thieves, erhält Bounty/Job‑EXP</li>
                    <li><strong>Thief:</strong> Greift Trader an, stiehlt Waren, verkauft in Verstecken</li>
                  </ul>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/neMQVw-zDbA/maxresdefault.jpg" 
                    alt="iSRO Job Guide"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Video‑Guide zu Jobbing in iSRO</p>
                </div>
              </div>
              <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                <p className="text-sm">
                  <strong>Praxis‑Tipp:</strong> Starte mit 1–2★‑Waren und baue Vertrauen zu Hunters auf. 
                  5★‑Trades nur in koordinierten Karawanen mit Voice‑Absprache.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Alchemy */}
        <section id="alchemy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">5. Alchemy‑System (Upgrades, Blues, Stones)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Grundprinzip</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li><em>Elixire</em> (+‑Upgrade) + <em>Lucky Powder</em> (Chancenboost) → Item‑Plus</li>
                    <li><em>Magic/Attribute Stones</em> → fügen Blues/Attribute hinzu</li>
                    <li>Je höher das Plus, desto höher die <em>Fail‑Chance</em></li>
                  </ol>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                    <p className="text-sm">
                      <strong>Wichtig:</strong> Höhere Lucky‑Powder‑Grade zum Item‑Degree passend nutzen. 
                      Bei Fails können Plus/Stats fallen.
                    </p>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Praktische Reihenfolge</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Basis‑Blues zuerst (Durability → Attack/Parry → STR/INT)</li>
                    <li>Dann Reinforce/Block etc. – je nach Waffe/Rüstungstyp</li>
                    <li>+‑Push zuletzt, weil teuer und riskant</li>
                  </ul>
                </div>
              </div>
              <img 
                src="https://img.youtube.com/vi/zNflGM1_3Ek/maxresdefault.jpg" 
                alt="Alchemy Guide"
                className="w-full rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground mt-2">Video‑Überblick zu Elixiren & Stones</p>
            </CardContent>
          </Card>
        </section>

        {/* Section 6: Crafting */}
        <section id="crafting" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">6. Crafting / Manufacturing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Neuere iSRO‑Updates führten ein <strong>Manufacturing/Crafting‑System</strong> ein: 
                Rezepte sammeln/registrieren, Materialien farmen, Chance‑basiert herstellen.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Rezepte</strong>: Drop aus Mobs/Instanzen; müssen im Crafting‑UI registriert werden</li>
                <li><strong>Materialien</strong>: Aus Drops, Dismantle/Salvage von Gear, Events</li>
                <li><strong>Erfolgschance</strong>: Variiert pro Item/Grad; <em>Fail zerstört Materialien</em></li>
              </ul>
              <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                <p className="text-sm">
                  <strong>Praxis:</strong> Erst günstige Rezepte skillen/testen, später teure Waffen craften. 
                  Material‑Engpässe via Gilde/Markt ausgleichen.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 7: Fortress War */}
        <section id="fortress" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">7. Fortress War (Gilden‑Endgame)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Gilden kämpfen um Festungen (z. B. Jangan/Hotan) – Gewinner erhält Prestige, 
                    <em>Steuereinnahmen</em> und strategische Vorteile.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Vorbereitung</strong>: Schicht‑Setup, Alchemy‑Bufffood, Speed‑Drugs, Flaggen</li>
                    <li><strong>Angriff</strong>: Synchronisierte Rammbock‑Pushes, Tower‑Focus, Port‑Cuts</li>
                    <li><strong>Verteidigung</strong>: Gate‑Rotation (Repair), Anti‑Wizard‑Screens</li>
                  </ul>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/XY2TifBJbkg/maxresdefault.jpg" 
                    alt="Fortress War"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Fortress‑War‑Gefechte</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 8: Dungeons */}
        <section id="dungeons" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">8. Dungeons & Forgotten World</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Forgotten World (FGW)</strong>: Talismane sammeln (Karten), Boss‑Läufe</li>
                <li><strong>Donwhang Cave</strong>, <strong>Qin‑Shi Tomb</strong>, <strong>Jupiter Temple</strong>: 
                  Level‑abhängige Gruppen‑Instanzen</li>
                <li><strong>Uniques</strong>: Weltbosse (z. B. Tiger Girl, Isyutaru, Lord Yarkan)</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Section 9: Economy */}
        <section id="economy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">9. Wirtschaft & Handel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Gold & Profite</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Regelmäßige 2–3★‑Trades (geringeres Risiko)</li>
                    <li>Farm‑Spots mit hoher <em>Mob‑Dichte</em></li>
                    <li>Drops/Elixire/Stones im Stall zu Peak‑Zeiten listen</li>
                  </ul>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Stall‑Grundsätze</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Preise beobachten (Screenshots/Notizen)</li>
                    <li>Bundle‑Verkäufe laufen besser als Einzelware</li>
                    <li>Event‑Fenster nutzen (Nachfrage‑Spitzen)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 10: Tips */}
        <section id="tips" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">10. Tipps & Ressourcen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Schnell‑Check</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Solo</strong>: Sichere Builds, konstante Spots, moderate Alchemy</li>
                    <li><strong>Party</strong>: Rollen klären (Heals/Taunts/Bursts), Spawn‑Kiting</li>
                    <li><strong>Job</strong>: Sterne langsam steigern; Thief‑Aktivität serverabhängig</li>
                    <li><strong>Fortress</strong>: Discord‑Pflicht, klare Calls, Wiederbelebungspunkte</li>
                  </ul>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Externe Quellen</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <a href="https://silkroadonline.fandom.com/wiki/Map" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Wiki (Fandom): Weltkarte & Städte
                      </a>
                    </li>
                    <li>
                      <a href="https://silkroadonline.fandom.com/wiki/Job" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Job‑System (Übersicht)
                      </a>
                    </li>
                    <li>
                      <a href="https://jellybitz.github.io/xSROMap/" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Interaktive Weltkarte
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/watch?v=zNflGM1_3Ek" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Alchemy‑Video (YouTube)
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/watch?v=neMQVw-zDbA" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Jobbing‑Video (YouTube)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Guide;
