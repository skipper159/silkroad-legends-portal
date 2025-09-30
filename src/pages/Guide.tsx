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
              <a href="#job" className="btn-outline text-center">4. Job System</a>
              <a href="#alchemy" className="btn-outline text-center">5. Alchemy System</a>
              <a href="#crafting" className="btn-outline text-center">6. Crafting/Manufacturing</a>
              <a href="#fortress" className="btn-outline text-center">7. Fortress War</a>
              <a href="#dungeons" className="btn-outline text-center">8. Dungeons & Forgotten World</a>
              <a href="#economy" className="btn-outline text-center">9. Economy & Trading</a>
              <a href="#tips" className="btn-outline text-center">10. Tips & Resources</a>
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

        {/* Section 4: Job System */}
        <section id="job" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">4. Job System (Trader • Hunter • Thief)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    From Level 20 you can freely choose a role: <strong>Trader</strong> (transport goods),{' '}
                    <strong>Hunter</strong> (protect) or <strong>Thief</strong> (raid). Star goods (1–5★) 
                    → more profit, but stronger NPC/Player Thieves.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Trader:</strong> Buys special goods, uses transport (Donkey/Camel/Ox etc.)</li>
                    <li><strong>Hunter:</strong> Joins traders, hunts Thieves, receives Bounty/Job EXP</li>
                    <li><strong>Thief:</strong> Attacks traders, steals goods, sells in hideouts</li>
                  </ul>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/neMQVw-zDbA/maxresdefault.jpg" 
                    alt="iSRO Job Guide"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Video Guide for Jobbing in iSRO</p>
                </div>
              </div>
              <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                <p className="text-sm">
                  <strong>Practical Tip:</strong> Start with 1–2★ goods and build trust with Hunters. 
                  5★ trades only in coordinated caravans with voice communication.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Alchemy */}
        <section id="alchemy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">5. Alchemy System (Upgrades, Blues, Stones)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Basic Principle</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li><em>Elixirs</em> (+ upgrade) + <em>Lucky Powder</em> (chance boost) → Item Plus</li>
                    <li><em>Magic/Attribute Stones</em> → add Blues/Attributes</li>
                    <li>The higher the Plus, the higher the <em>fail chance</em></li>
                  </ol>
                  <div className="bg-accent/10 border-l-4 border-accent p-4 rounded mt-4">
                    <p className="text-sm">
                      <strong>Important:</strong> Use higher Lucky Powder grades matching the item degree. 
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
              <img 
                src="https://img.youtube.com/vi/zNflGM1_3Ek/maxresdefault.jpg" 
                alt="Alchemy Guide"
                className="w-full rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground mt-2">Video overview of Elixirs & Stones</p>
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

        {/* Section 7: Fortress War */}
        <section id="fortress" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">7. Fortress War (Guild Endgame)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Guilds fight for fortresses (e.g., Jangan/Hotan) – winner receives prestige, 
                    <em>tax income</em> and strategic advantages.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Preparation</strong>: Layer setup, Alchemy buff food, Speed drugs, Flags</li>
                    <li><strong>Attack</strong>: Synchronized battering ram pushes, Tower focus, Port cuts</li>
                    <li><strong>Defense</strong>: Gate rotation (Repair), Anti-Wizard screens</li>
                  </ul>
                </div>
                <div>
                  <img 
                    src="https://img.youtube.com/vi/XY2TifBJbkg/maxresdefault.jpg" 
                    alt="Fortress War"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Fortress War Battles</p>
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
                <li><strong>Forgotten World (FGW)</strong>: Collect talismans (maps), boss runs</li>
                <li><strong>Donwhang Cave</strong>, <strong>Qin Shi Tomb</strong>, <strong>Jupiter Temple</strong>: 
                  Level-dependent group instances</li>
                <li><strong>Uniques</strong>: World bosses (e.g., Tiger Girl, Isyutaru, Lord Yarkan)</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Section 9: Economy */}
        <section id="economy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">9. Economy & Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Gold & Profits</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Regular 2–3★ trades (lower risk)</li>
                    <li>Farm spots with high <em>mob density</em></li>
                    <li>List drops/elixirs/stones in stall during peak times</li>
                  </ul>
                </div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-3">Stall Principles</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Monitor prices (screenshots/notes)</li>
                    <li>Bundle sales work better than single items</li>
                    <li>Use event windows (demand peaks)</li>
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
              <CardTitle className="text-3xl">10. Tips & Resources</CardTitle>
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
