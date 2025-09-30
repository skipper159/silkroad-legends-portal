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
            Silkroad Online (iSRO) – Complete Game Guide
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 text-muted-foreground">
            Structured, practical, and with visual aids. This guide covers all important aspects of the game.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
          <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="#intro" className="btn-outline text-center">1. Introduction</a>
              <a href="#start" className="btn-outline text-center">2. Getting Started & Characters</a>
              <a href="#leveling" className="btn-outline text-center">3. Leveling Routes (1–40)</a>
              <a href="#mastery" className="btn-outline text-center">4. Mastery Guide</a>
              <a href="#job" className="btn-outline text-center">5. Job System</a>
              <a href="#alchemy" className="btn-outline text-center">6. Equipment & Alchemy</a>
              <a href="#grinding" className="btn-outline text-center">7. Grinding Spots & Party Play</a>
              <a href="#dungeons" className="btn-outline text-center">8. Dungeons & Special Content</a>
              <a href="#economy" className="btn-outline text-center">9. Economy & Trading</a>
              <a href="#endgame" className="btn-outline text-center">10. Endgame (110+)</a>
              <a href="#crafting" className="btn-outline text-center">Crafting/Manufacturing</a>
              <a href="#fortress" className="btn-outline text-center">Fortress War</a>
              <a href="#tips" className="btn-outline text-center">Tips & Resources</a>
            </nav>
          </CardContent>
        </Card>

        {/* Section 1: Einführung */}
        <section id="intro" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    <strong>Silkroad Online</strong> is a classic MMORPG by Joymax, famous for the{' '}
                    <em>Triangular Conflict</em> between <strong>Trader</strong>, <strong>Hunter</strong>, and{' '}
                    <strong>Thief</strong> (PvP economy) as well as the guild endgame <strong>Fortress War</strong>. 
                    The world spans from China through Central Asia to Europe.
                  </p>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                    <p className="text-sm">
                      <strong>Historical:</strong> The game thematically focuses on the trade routes of the historic{' '}
                      <em>Silk Road</em> – cities, caravans, and bandits included.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">F2P</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">PvE + PvP</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Karawanen</span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">Guild Wars</span>
                  </div>
                </div>
                <div>
                  <img 
                    src="https://static.wikia.nocookie.net/silkroad/images/c/c0/Silkroad_World_Map3.jpg/revision/latest/scale-to-width-down/1200" 
                    alt="World Map of Silkroad Online"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    World Map (Source: Silkroad Online Wiki / Fandom)
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
              <CardTitle className="text-3xl">2. Getting Started & Characters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">China vs. Europe (Quick & Honest)</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>China</strong>: Solid solo classes, simple potion rotation, strong 1v1 scaling, flexible hybrid builds.</li>
                  <li><strong>Europe</strong>: Party-strong (buff synergies), clear roles (e.g., Wizard/Cleric, Warrior/Cleric), slightly more challenging solo.</li>
                </ul>
                <p className="mt-3"><strong>Recommendation for Beginners:</strong> CH Glaive (STR) or EU Warrior/Cleric – forgiving errors, stable farming.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">First Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Complete Main Story & City Quests (additional EXP + Gold).</li>
                    <li>Set up Auto-Potion properly (HP/MP thresholds, keep Return Scrolls ready).</li>
                    <li>Upgrade gear <em>gradually</em> – no expensive risky upgrades early on.</li>
                  </ol>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Quality of Life</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Use Grab/Transport Pets (loot comfort, carrying capacity).</li>
                    <li>Monitor the Stall network (develop price sense).</li>
                    <li>Find a Guild – for Buffs, Fortress & Caravans.</li>
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
              <CardTitle className="text-3xl">3. Leveling Routes (1–40)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Proven Hunting Grounds</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>1–10</strong>: Starting zones around <em>Jangan</em>/<em>Constantinople</em></li>
                    <li><strong>10–20</strong>: Bandits/Hyongchas (Donwhang area)</li>
                    <li><strong>20–30</strong>: Ongs / Penons – dense spawns, good EXP/HP ratio</li>
                    <li><strong>30–40</strong>: Sonkar/Isy areas (careful), Hyeongcheons, Earth Ghosts</li>
                  </ul>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                    <p className="text-sm">Solo → Focus on dense spawn fields. In Party → Wizard/Cleric train clears spots very efficiently.</p>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Equipment</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>NPC gear only as <em>temporary solution</em>; better: Drops & cheap +3/+4 from Stall</li>
                    <li>Prioritize weapons (DPS scales EXP/h the most)</li>
                    <li>Blues: <em>Durability</em>, <em>Attack/Parry</em>, situationally <em>STR/INT</em></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Mastery Guide */}
        <section id="mastery" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">4. Mastery Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Mastery Limits & Stat Distributions</h3>
                  <p className="mb-4 text-muted-foreground">
                    Chinese builds combine <em>Weapon Masteries</em> (Bicheon/Heuksal/Pacheon) and{' '}
                    <em>Element Masteries</em> (Fire/Cold/Light/Force). Europeans play fixed classes (Wizard/Cleric/…); 
                    sub-skills complement the role. Classic distributions:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Pure STR</strong> – maximum physical damage/HP; tanks & melee fighters</li>
                    <li><strong>Pure INT</strong> – maximum magical damage/MP; nukers & casters</li>
                    <li><strong>Hybrid 2:1</strong> – e.g., <code>2 INT : 1 STR</code> or vice versa; balanced for solo PvE</li>
                  </ul>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                    <p className="text-sm">
                      <strong>Note:</strong> Server caps change mastery maximum values (e.g., 300/330/360/440 points). 
                      Check your iSRO server's current cap.
                    </p>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Recommended Builds (PvE/PvP)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2">Race</th>
                          <th className="text-left p-2">Build</th>
                          <th className="text-left p-2">Stat</th>
                          <th className="text-center p-2">PvE</th>
                          <th className="text-center p-2">PvP</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border">
                          <td className="p-2">CH</td>
                          <td className="p-2">Bow (Pacheon) + Lightning + Fire</td>
                          <td className="p-2">Pure INT / 2:1 INT:STR</td>
                          <td className="text-center p-2">★★★★★</td>
                          <td className="text-center p-2">★★★☆☆</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2">CH</td>
                          <td className="p-2">Spear (Heuksal) + Lightning + Cold</td>
                          <td className="p-2">Pure INT</td>
                          <td className="text-center p-2">★★★★☆</td>
                          <td className="text-center p-2">★★★★☆</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2">CH</td>
                          <td className="p-2">Glaive (Heuksal) + Fire + Lightning</td>
                          <td className="p-2">Pure STR</td>
                          <td className="text-center p-2">★★★★☆</td>
                          <td className="text-center p-2">★★★★☆</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2">CH</td>
                          <td className="p-2">Blade/Sword (Bicheon) + Cold + Fire</td>
                          <td className="p-2">2:1 STR:INT</td>
                          <td className="text-center p-2">★★★☆☆</td>
                          <td className="text-center p-2">★★★★☆</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2">EU</td>
                          <td className="p-2">Wizard / Cleric</td>
                          <td className="p-2">—</td>
                          <td className="text-center p-2">★★★★★</td>
                          <td className="text-center p-2">★★★☆☆</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2">EU</td>
                          <td className="p-2">Warrior / Cleric</td>
                          <td className="p-2">—</td>
                          <td className="text-center p-2">★★★★☆</td>
                          <td className="text-center p-2">★★★★★</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2">EU</td>
                          <td className="p-2">Rogue / Cleric</td>
                          <td className="p-2">—</td>
                          <td className="text-center p-2">★★★★☆</td>
                          <td className="text-center p-2">★★★★☆</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="p-2">EU</td>
                          <td className="p-2">Warlock / Cleric</td>
                          <td className="p-2">—</td>
                          <td className="text-center p-2">★★★☆☆</td>
                          <td className="text-center p-2">★★★★☆</td>
                        </tr>
                        <tr>
                          <td className="p-2">EU</td>
                          <td className="p-2">Bard / Cleric</td>
                          <td className="p-2">—</td>
                          <td className="text-center p-2">★★★★☆</td>
                          <td className="text-center p-2">★★★☆☆</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Job System */}
        <section id="job" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">5. Job System (from Lv. 20)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    From Level 20 you can freely choose a role: <strong>Trader</strong> (transport goods),{' '}
                    <strong>Hunter</strong> (protect) or <strong>Thief</strong> (raid). Star goods (1–5★) 
                    → more profit, but stronger NPC/Player Thieves. <em>Safe Trade</em> exists (lower profit, minimal PvP risk).
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Trader:</strong> Buys special goods, uses transport (Donkey/Camel/Ox etc.), sells in other city for profit</li>
                    <li><strong>Hunter:</strong> Joins traders, hunts Thieves, receives Bounty/Job EXP</li>
                    <li><strong>Thief:</strong> Attacks traders, steals goods, sells in hideouts; watch Karma system</li>
                  </ul>
                </div>
                <div className="card bg-muted/20">
                  <h3 className="text-lg font-semibold mb-3">Triangular Conflict (Schema)</h3>
                  <div className="flex justify-center items-center h-48 text-muted-foreground">
                    <div className="text-center space-y-2">
                      <p className="text-sm">Hunter ⟷ Thief ⟷ Trader</p>
                      <p className="text-xs">More stars = more risk/reward</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">First Trade – Step by Step</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li><strong>Choose Job</strong> (Trader) at Merchant Associate from Lv. 20; equip <em>Job Suit</em></li>
                  <li><strong>Summon Transport</strong> (Donkey/Camel/Wagon) & choose Star rating of goods (1★ safe → 5★ risky)</li>
                  <li>Route: <em>Jangan → Donwhang</em> (beginner); optionally find Hunter party</li>
                  <li>At destination sell at Specialty Trader → <strong>Gold + Job EXP</strong></li>
                </ol>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src="https://img.youtube.com/vi/neMQVw-zDbA/maxresdefault.jpg" 
                    alt="iSRO Job Guide"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Video Guide for Jobbing in iSRO</p>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Job Suits & Transports</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Trader Suit</strong> – Required for loading/selling; more slots with higher transport</li>
                    <li><strong>Hunter Suit</strong> – Enables hunting Thieves; Defense/HP relevant</li>
                    <li><strong>Thief Suit</strong> – Access to hideouts/fences; Karma colors (white/orange/red)</li>
                    <li><strong>Transports</strong> – Donkey/Camel/Wagon; more stars ⇒ slower, but more profitable</li>
                  </ul>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                    <p className="text-sm">5★ only in coordination with Hunters/Voice. Solo: 1–2★, but regularly.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 6: Equipment & Alchemy */}
        <section id="alchemy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">6. Equipment & Alchemy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Basic Principle</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li><em>Elixirs</em> (+ upgrade) + <em>Lucky Powder</em> (chance boost) → Item Plus</li>
                    <li><em>Magic/Attribute Stones</em> → add Blues/Attributes (e.g., STR/INT, Durability, Attack/Parry)</li>
                    <li>The higher the Plus, the higher the <em>fail chance</em> – Play safe: Stop at +5/+7 (server dependent)</li>
                  </ol>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                    <p className="text-sm">
                      <strong>Important:</strong> Use higher Lucky Powder grades matching item degree. 
                      On fails, Plus/Stats can decrease.
                    </p>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Practical Order</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Base Blues first (Durability → Attack/Parry → STR/INT)</li>
                    <li>Then Reinforce/Block etc. – depending on weapon/armor type</li>
                    <li>+ push last, because expensive and risky</li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Item Drops & SoX Grades</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Seal of Star (SoS)</strong> – roughly ≈ <em>+5 Level</em> above Normal</li>
                  <li><strong>Seal of Moon (SoM)</strong> – roughly ≈ <em>+10 Level</em></li>
                  <li><strong>Seal of Sun (SoSun)</strong> – roughly ≈ <em>+15 Level</em>, extremely rare</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Alchemy Basics (Summary)</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Item + <em>Elixir</em> + <em>Lucky Powder</em> ⇒ <code>+</code> upgrade (chance)</li>
                    <li><em>Magic/Attribute Stones</em> ⇒ <strong>Blues</strong> (STR/INT, Parry, Crit, Durability …)</li>
                    <li>Safety: Use <strong>Immortal</strong>/<strong>Astral</strong> before pushing higher</li>
                  </ol>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/zNflGM1_3Ek/maxresdefault.jpg" 
                    alt="Alchemy Guide"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Overview of Elixirs & Stones</p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Glow Orientation (Classic)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">+</th>
                        <th className="text-left p-2">Glow</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-2">+3/+4</td>
                        <td className="p-2">light, clear shine</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-2">+5/+6</td>
                        <td className="p-2">violet/pink</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-2">+7/+8</td>
                        <td className="p-2">golden/orange</td>
                      </tr>
                      <tr>
                        <td className="p-2">+9/+10</td>
                        <td className="p-2">turquoise/blue-green</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                  <p className="text-sm">Server special glows from +11 possible. Push conservatively (Secure → Push → Pause).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 7: Grinding Spots & Party Play */}
        <section id="grinding" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">7. Grinding Spots & Party Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Best Spots (Traditional iSRO Routes)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Level</th>
                        <th className="text-left p-2">Spot</th>
                        <th className="text-left p-2">Why</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-2">15–25</td>
                        <td className="p-2">Bandits (Jangan/Donwhang)</td>
                        <td className="p-2">Short distances, dense spawns</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-2">40–52</td>
                        <td className="p-2">Penon Fighter/Warrior (Karakoram)</td>
                        <td className="p-2">Very good XP, clear terrain</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-2">52–64</td>
                        <td className="p-2">Ongs (Oasis → Samarkand side)</td>
                        <td className="p-2">Extreme spawn density, ideal for AoE PT</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-2">60–76</td>
                        <td className="p-2">Niyaa Desert / Mix</td>
                        <td className="p-2">Many party/champion mobs</td>
                      </tr>
                      <tr>
                        <td className="p-2">80–100</td>
                        <td className="p-2">Jangan Cave / Roc Mountain</td>
                        <td className="p-2">PT-friendly, solid drops</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Solo vs. Party</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Solo</strong>: Bow/Wizard/Rogue clear fast; Blade/Warrior safe but slower</li>
                    <li><strong>Full PT (EU)</strong>: 2× Wizard, 1× Warlock, 1× Warrior, 1× Bard, 1–2× Cleric, 1× Rogue (Lure)</li>
                  </ul>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Auto-Potion & Botting (Reality)</h3>
                  <p className="text-sm text-muted-foreground">
                    Use Auto-Potion in client (HP 80%, MP 60%, Vigor 50–60%). Bot density varies – 
                    play hotspots at staggered times.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <img 
                    src="https://img.youtube.com/vi/ncv7mPZDijs/maxresdefault.jpg" 
                    alt="Bandit Spot"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Bandits around Jangan/Donwhang</p>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/YjAr490GLS0/maxresdefault.jpg" 
                    alt="Penon Fighter/Warrior"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Penons in Karakoram</p>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/viMTs-4jEyc/maxresdefault.jpg" 
                    alt="Ong Farm"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Ong Farm – dense spawns, SP farm classic</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 8: Dungeons & Special Content */}
        <section id="dungeons" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">8. Dungeons & Special Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="card">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Forgotten World (FGW)</strong>: Collect talismans (cards), boss runs; rewards for sets/weapons</li>
                  <li><strong>Donwhang Cave</strong>, <strong>Qin Shi Tomb</strong>, <strong>Jupiter Temple</strong>: Level-dependent group instances with robust drops</li>
                  <li><strong>Uniques</strong>: World bosses (e.g., Tiger Girl, Isyutaru, Lord Yarkan) – keep track of timers/spawns</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Forgotten World (Talisman Quest)</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Find & destroy <strong>Dimension Pillar</strong> → <em>Envies</em> spawn</li>
                  <li>Kill Envies → <strong>Dimension Hole</strong> drops (time limited)</li>
                  <li>Use <em>Hole</em> in city → enter instance, collect talismans</li>
                </ol>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <img 
                      src="https://static.wikia.nocookie.net/silkroad/images/f/f7/Dimension_Hole.jpg/revision/latest/scale-to-width-down/400" 
                      alt="Dimension Pillar"
                      className="w-full rounded-lg border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Dimension Pillar (world object)</p>
                  </div>
                  <div>
                    <img 
                      src="https://static.wikia.nocookie.net/silkroad/images/4/4e/Envies_near_Dimension_Hole.jpg/revision/latest/scale-to-width-down/400" 
                      alt="Envies at Dimension Hole"
                      className="w-full rounded-lg border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Envies after destroying</p>
                  </div>
                  <div>
                    <img 
                      src="https://static.wikia.nocookie.net/silkroad/images/1/18/6.jpg/revision/latest/scale-to-width-down/400" 
                      alt="Dimension Hole in city"
                      className="w-full rounded-lg border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Dimension Hole in city – instance access</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Additional Content</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Roc Mountain</strong> – High-level area/boss; PT drops</li>
                  <li><strong>Jangan Cave (Qin Shi Tomb)</strong> – multi-floor, 80–100+; PT-friendly</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <img 
                    src="https://img.youtube.com/vi/NkbCvdDihwk/maxresdefault.jpg" 
                    alt="Roc Mountain"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Legend III – Roc Mountain</p>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/lh2zItd6PS0/maxresdefault.jpg" 
                    alt="Qin Shi Tomb"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Legend IV – Qin Shi Tomb</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 9: Economy & Trading */}
        <section id="economy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">9. Economy & Trading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Gold & Profits</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Regular 2–3★ trades (lower risk, plannable profit)</li>
                    <li>Farm spots with high <em>mob density</em> + low potion quota</li>
                    <li>List drops/elixirs/stones in stall during peak times</li>
                  </ul>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Stall Principles</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Monitor prices (screenshots/notes), avoid under/overpricing</li>
                    <li>Bundle sales (elixirs/stones) work better than single items</li>
                    <li>Use event windows (demand spikes)</li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Stall Network & Consignment</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Stall Network</strong>: List items without being online; note fees; use peak times</li>
                  <li><strong>Consignment</strong>: Special goods server-wide; can trigger job events</li>
                  <li><strong>Silk Items</strong>: Premium/VIP (EXP/SP bonuses), Pets, Inventory expansions, Alchemy securities</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 10: Endgame */}
        <section id="endgame" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">10. Endgame (Lv. 110+ Cap)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-3">PvP (Fortress War, Guild Wars)</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Fortress War</strong>: Time-window battles; organization & target calls beat raw gear score</li>
                  <li><strong>Guild Wars</strong>: Open skirmishes; train buff sync & focus targets</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">High-Level Builds</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>EU</strong>: Warrior/Cleric as anchor; Wizard stacks; Warlock debuffs; Bard songs</li>
                  <li><strong>CH</strong>: Spear INT nuker (Lightning/Cold), Glaive STR front, Bow kite (Fire/Light)</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-3">Rare Items & Dungeons</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Alexandria</strong> → Temple & Job Temple Uniques: Coins/materials for EGY/Nova sets</li>
                  <li><strong>Jupiter Temple</strong>: High-end instances (server dependent)</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <img 
                    src="https://img.youtube.com/vi/133UrP4w8_A/maxresdefault.jpg" 
                    alt="Jupiter Temple"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Jupiter Temple – Gameplay</p>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/hmpGhkEAucU/maxresdefault.jpg" 
                    alt="Zealots Hideout"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Zealots Hideout (Jupiter)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Crafting Section */}
        <section id="crafting" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">6. Crafting / Manufacturing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Recent iSRO updates introduced a <strong>Manufacturing/Crafting System</strong>: 
                Collect/register recipes, farm materials, chance-based crafting.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Recipes</strong>: Drop from mobs/instances; must be registered in Crafting UI</li>
                <li><strong>Materials</strong>: From drops, Dismantle/Salvage of gear, Events</li>
                <li><strong>Success chance</strong>: Varies per item/grade; <em>fail destroys materials</em></li>
              </ul>
              <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                <p className="text-sm">
                  <strong>Practice:</strong> First skill/test cheap recipes, later craft expensive weapons. 
                  Balance material shortages via guild/market.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fortress War Section */}
        <section id="fortress" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Fortress War (Guild Endgame)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Guilds fight for fortresses (e.g., Jangan/Hotan) – winner receives prestige, 
                    <em>tax income</em> and strategic advantages. Structure: Outer walls, gates, watchtowers, barricades, heart. 
                    Roles: Attackers break through → destroy heart; Defenders repair/hold positions.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Preparation</strong>: Shift setup (Frontline, Flanker, Utility), Alchemy buff food, Speed drugs, Flags</li>
                    <li><strong>Attack</strong>: Synchronized battering ram pushes, Tower focus, Port cuts, secure respawn points</li>
                    <li><strong>Defense</strong>: Gate rotation (Repair), Anti-Wizard screens, retreat markers</li>
                  </ul>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/XY2TifBJbkg/maxresdefault.jpg" 
                    alt="Fortress War"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Fortress War battles – Practical insights into tactics & chaos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tips & Resources Section */}
        <section id="tips" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Tips & Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Quick Check</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Solo</strong>: Safe builds, consistent spots, moderate Alchemy</li>
                    <li><strong>Party</strong>: Clarify roles (Heals/Taunts/Bursts), spawn kiting</li>
                    <li><strong>Job</strong>: Increase stars slowly; Thief activity server-dependent</li>
                    <li><strong>Fortress</strong>: Discord mandatory, clear calls, respawn points</li>
                  </ul>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">External Resources (for in-depth images/info)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <a href="https://silkroadonline.fandom.com/wiki/Map" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Wiki (Fandom): World Map & Cities
                      </a>
                    </li>
                    <li>
                      <a href="https://silkroadonline.fandom.com/wiki/Job" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Job System (Overview/PNGs)
                      </a>
                    </li>
                    <li>
                      <a href="https://jellybitz.github.io/xSROMap/" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Interactive World Map: xSROMap
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/watch?v=zNflGM1_3Ek" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Alchemy Video (Elixirs/Stones): YouTube TweakMMO
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/watch?v=neMQVw-zDbA" target="_blank" rel="noopener" className="text-accent hover:underline">
                        Jobbing Video (iSRO): YouTube Job Guide
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-muted/20 p-4 rounded mt-6">
                <p className="text-xs text-muted-foreground">
                  <strong>Image Rights Notice:</strong> Linked thumbnails/CC-BY-SA material remain with respective rights holders. 
                  For self-hosted screenshots, take your own in-game shots.
                </p>
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
