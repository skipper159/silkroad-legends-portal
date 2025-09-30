import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BeginnerGuide = () => {
  return (
    <>
      <Navbar />

      <div className="py-12 bg-header-bg bg-cover bg-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Beginner Guide <span className="text-lafftale-bronze font-cinzel text-4xl font-bold">Lafftale</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 text-gray-300">
            Your complete guide to starting your adventure in Silkroad Online
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Introduction */}
        <section id="intro">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Silkroad Online</strong> is a classic MMORPG by Joymax, famous for the <em>Triangular Conflict</em> between <strong>Trader</strong>, <strong>Hunter</strong>, and <strong>Thief</strong> (PvP economy) as well as the guild endgame <strong>Fortress War</strong>. The world spans from China through Central Asia to Europe.
              </p>
              <p className="bg-muted/20 p-4 rounded-lg border-l-4 border-primary">
                Historical: The game thematically focuses on the trade routes of the historic <em>Silk Road</em> – cities, caravans, and bandits included.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-muted/30 rounded-full text-sm">F2P</span>
                <span className="inline-block px-3 py-1 bg-muted/30 rounded-full text-sm">PvE + PvP</span>
                <span className="inline-block px-3 py-1 bg-muted/30 rounded-full text-sm">Caravans</span>
                <span className="inline-block px-3 py-1 bg-muted/30 rounded-full text-sm">Guild Wars</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Getting Started */}
        <section id="start">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">2. Getting Started & Characters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">China vs. Europe (Quick & Honest)</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>China</strong>: Solid solo classes, simple potion rotation, strong 1v1 scaling, flexible hybrid builds.</li>
                  <li><strong>Europe</strong>: Party-strong (buff synergies), clear roles (e.g., Wizard/Cleric, Warrior/Cleric), somewhat more demanding solo.</li>
                </ul>
                <p className="mt-4"><strong>Recommendation for newbies:</strong> CH Glaive (STR) or EU Warrior/Cleric – forgiving of mistakes, stable farming.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">First Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Complete main story & city quests (extra EXP + Gold).</li>
                    <li>Set up auto-potion properly (HP/MP thresholds, Return Scrolls ready).</li>
                    <li>Upgrade gear <em>gradually</em> – no expensive gambles early on.</li>
                  </ol>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Quality of Life</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Use Grab/Transport Pets (loot comfort, carrying capacity).</li>
                    <li>Watch stall network (develop price awareness).</li>
                    <li>Find a guild – for buffs, Fortress & caravans.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Leveling Routes */}
        <section id="leveling">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">3. Leveling Routes (1–40)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Proven Hunting Grounds</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>1–10</strong>: Starting zones around <em>Jangan</em>/<em>Constantinople</em></li>
                    <li><strong>10–20</strong>: Bandits/Hyongchas (Donwhang area)</li>
                    <li><strong>20–30</strong>: Ongs / Penons – dense spawn, good EXP/HP ratio</li>
                    <li><strong>30–40</strong>: Sonkar/Isy areas (careful), Hyeongcheons, Earth Ghosts</li>
                  </ul>
                  <p className="mt-4 bg-primary/10 p-3 rounded border-l-4 border-primary text-sm">
                    Solo → Focus on dense spawn fields. In party → Wizard/Cleric train rocks spots very efficiently.
                  </p>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Equipment</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>NPC gear only as <em>interim solution</em>; better: drops & cheap +3/+4 from stalls</li>
                    <li>Prioritize weapons (DPS scales EXP/h most strongly)</li>
                    <li>Blues: <em>Durability</em>, <em>Attack/Parry</em>, situational <em>STR/INT</em></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mastery Guide */}
        <section id="mastery">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">4. Mastery Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Mastery Limits & Stat Distributions</h3>
                <p className="text-muted-foreground mb-4">
                  Chinese builds combine <em>weapon</em> (Bicheon/Heuksal/Pacheon) and <em>element masteries</em> (Fire/Cold/Light/Force). Europeans play fixed classes (Wizard/Cleric/…); sub-skills complement the role. Classic distributions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Pure STR</strong> – maximum physical damage/HP; tanks & melee fighters</li>
                  <li><strong>Pure INT</strong> – maximum magical damage/MP; nukers & casters</li>
                  <li><strong>Hybrid 2:1</strong> – e.g., <code>2 INT : 1 STR</code> or vice versa; balanced for solo PvE</li>
                </ul>
                <p className="mt-4 bg-primary/10 p-3 rounded border-l-4 border-primary text-sm">
                  Server caps change mastery maximum values (e.g., 300/330/360/440 points). Check the <em>current cap</em> of your iSRO server.
                </p>
              </div>

              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-3">Recommended Builds (PvE/PvP)</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Race</th>
                      <th className="text-left p-2">Build</th>
                      <th className="text-left p-2">Stat</th>
                      <th className="text-left p-2">PvE</th>
                      <th className="text-left p-2">PvP</th>
                      <th className="text-left p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="p-2">CH</td>
                      <td className="p-2">Bow (Pacheon) + Lightning + Fire</td>
                      <td className="p-2">Pure INT or 2:1 INT:STR</td>
                      <td className="p-2">★★★★★</td>
                      <td className="p-2">★★★☆☆</td>
                      <td className="p-2">Kiting, strong ST-DPS, good solo</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">CH</td>
                      <td className="p-2">Spear (Heuksal) + Lightning + Cold</td>
                      <td className="p-2">Pure INT</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">Nuker burst, Cold def/freeze</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">CH</td>
                      <td className="p-2">Glaive (Heuksal) + Fire + Lightning</td>
                      <td className="p-2">Pure STR</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">Tanky melee, Ghost Spear chains</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">CH</td>
                      <td className="p-2">Blade/Sword (Bicheon) + Cold + Fire</td>
                      <td className="p-2">2:1 STR:INT</td>
                      <td className="p-2">★★★☆☆</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">Defensive, Parry/Block, control</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">EU</td>
                      <td className="p-2">Wizard / Cleric</td>
                      <td className="p-2">—</td>
                      <td className="p-2">★★★★★</td>
                      <td className="p-2">★★★☆☆</td>
                      <td className="p-2">Best PvE clear, PvP support-dependent</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">EU</td>
                      <td className="p-2">Warrior / Cleric</td>
                      <td className="p-2">—</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★★★</td>
                      <td className="p-2">Frontliner (Pain Quota, SK), high team value</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">EU</td>
                      <td className="p-2">Rogue / Cleric</td>
                      <td className="p-2">—</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">Dagger/Xbow burst, requires positioning</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">EU</td>
                      <td className="p-2">Warlock / Cleric</td>
                      <td className="p-2">—</td>
                      <td className="p-2">★★★☆☆</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">Debuffs (Impotent/Division), group pressure</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">EU</td>
                      <td className="p-2">Bard / Cleric</td>
                      <td className="p-2">—</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★☆☆</td>
                      <td className="p-2">Speed/MP songs, mandatory in full PT</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Job System */}
        <section id="job">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">5. Job System (from Lv. 20)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                From level 20, you freely choose a role: <strong>Trader</strong> (transport goods), <strong>Hunter</strong> (protect), or <strong>Thief</strong> (raid). Star goods (1–5★) → more profit, but stronger NPC/player thieves. <em>Safe Trade</em> exists (low profit, little PvP risk).
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Trader</h3>
                  <p className="text-sm text-muted-foreground">Buys specialty goods, uses transport (donkey/camel/ox etc.), sells in another city for profit.</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Hunter</h3>
                  <p className="text-sm text-muted-foreground">Joins traders, hunts thieves, receives bounty/job EXP.</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Thief</h3>
                  <p className="text-sm text-muted-foreground">Attacks traders, steals goods, sells in hideouts; consider karma system.</p>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">First Trade – Step by Step</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li><strong>Choose job</strong> (Trader) at Merchant Associate from Lv. 20; equip <em>job suit</em>.</li>
                  <li><strong>Summon transport</strong> (donkey/camel/wagon) & choose star rating of goods (1★ safe → 5★ risky).</li>
                  <li>Route: <em>Jangan → Donwhang</em> (beginner); find hunter party if needed.</li>
                  <li>At destination, sell at specialty trader → <strong>Gold + Job EXP</strong>.</li>
                </ol>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm">Practice tip: Start with 1–2★ goods and build trust with hunters. 5★ trades only in coordinated caravans with voice communication.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Equipment & Alchemy */}
        <section id="alchemy">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">6. Equipment & Alchemy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Basic Principle</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li><em>Elixirs</em> (+ upgrade) + <em>Lucky Powder</em> (chance boost) → Item Plus</li>
                    <li><em>Magic/Attribute Stones</em> → add blues/attributes (e.g., STR/INT, Durability, Attack/Parry)</li>
                    <li>Higher plus = higher <em>fail chance</em> – Play safe: stop at +5/+7 (server-dependent)</li>
                  </ol>
                  <p className="mt-4 bg-primary/10 p-3 rounded border-l-4 border-primary text-sm">
                    Important: Use higher lucky powder grades matching item degree. On fails, plus/stats can drop.
                  </p>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Practical Order</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Base blues first (Durability → Attack/Parry → STR/INT)</li>
                    <li>Then Reinforce/Block etc. – depending on weapon/armor type</li>
                    <li>+ push last, because expensive and risky</li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Item Drops & SoX Grades</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Seal of Star (SoS)</strong> – roughly ≈ <em>+5 Level</em> above Normal</li>
                  <li><strong>Seal of Moon (SoM)</strong> – roughly ≈ <em>+10 Level</em></li>
                  <li><strong>Seal of Sun (SoSun)</strong> – roughly ≈ <em>+15 Level</em>, extremely rare</li>
                </ul>
              </div>

              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-3">Glow Orientation (Classic)</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">+</th>
                      <th className="text-left p-2">Glow</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="p-2">+3/+4</td>
                      <td className="p-2">Slight, clear shine</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">+5/+6</td>
                      <td className="p-2">Violet/pink</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">+7/+8</td>
                      <td className="p-2">Golden/orange</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">+9/+10</td>
                      <td className="p-2">Turquoise/blue-green</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-4 bg-primary/10 p-3 rounded border-l-4 border-primary text-sm">
                  Server special glows from +11 possible. Push conservatively (backup → push → pause).
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Grinding Spots */}
        <section id="grinding">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">7. Grinding Spots & Party Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold mb-3">Best Spots (Traditional iSRO Routes)</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Level</th>
                      <th className="text-left p-2">Spot</th>
                      <th className="text-left p-2">Why</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="p-2">15–25</td>
                      <td className="p-2">Bandits (Jangan/Downhang)</td>
                      <td className="p-2">Short distances, dense spawns</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">40–52</td>
                      <td className="p-2">Penon Fighter/Warrior (Karakoram)</td>
                      <td className="p-2">Very good XP, clear terrain</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">52–64</td>
                      <td className="p-2">Ongs (Oasis → Samarkand side)</td>
                      <td className="p-2">Extreme spawn density, ideal for AoE PT</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">60–76</td>
                      <td className="p-2">Niyaa Desert / Mix</td>
                      <td className="p-2">Many party/champion mobs</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2">80–100</td>
                      <td className="p-2">Jangan Cave / Roc Mountain</td>
                      <td className="p-2">PT-friendly, solid drops</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Solo vs. Party</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Solo</strong>: Bow/Wizard/Rogue clear quickly; Blade/Warrior safer but slower</li>
                    <li><strong>Full PT (EU)</strong>: 2× Wizard, 1× Warlock, 1× Warrior, 1× Bard, 1–2× Cleric, 1× Rogue (Lure)</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Auto-Potion & Botting</h3>
                  <p className="text-sm text-muted-foreground">
                    Use auto-potion in client (HP 80%, MP 60%, Vigor 50–60%). Bot density varies – play hotspots at offset times.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dungeons */}
        <section id="dungeons">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">8. Dungeons & Special Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Forgotten World (FGW)</strong>: Collect talismans (cards), boss runs; rewards for sets/weapons</li>
                  <li><strong>Donwhang Cave</strong>, <strong>Qin-Shi Tomb</strong>, <strong>Jupiter Temple</strong>: Level-dependent group instances with robust drops</li>
                  <li><strong>Uniques</strong>: World bosses (e.g., Tiger Girl, Isyutaru, Lord Yarkan) – keep track of timers/spawns</li>
                </ul>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Forgotten World (Talisman Quest)</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Find & destroy <strong>Dimension Pillar</strong> → <em>Envies</em> spawn</li>
                  <li>Kill Envies → <strong>Dimension Hole</strong> drops (time-limited)</li>
                  <li>In town, use <em>Hole</em> → enter instance, collect talismans</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Crafting */}
        <section id="crafting">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">9. Crafting / Manufacturing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Newer iSRO updates introduced a <strong>Manufacturing/Crafting system</strong>: collect/register recipes, farm materials, chance-based crafting (on fail, materials are lost). This allows you to build special weapons/items.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Recipes</strong>: Drop from mobs/instances; must be registered in crafting UI</li>
                <li><strong>Materials</strong>: From drops, dismantle/salvage gear, events</li>
                <li><strong>Success chance</strong>: Varies per item/grade; <em>fail destroys materials</em></li>
              </ul>
              <p className="mt-4 bg-primary/10 p-3 rounded border-l-4 border-primary text-sm">
                Practice: First skill/test cheap recipes, later craft expensive weapons. Compensate material bottlenecks via guild/market.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Economy */}
        <section id="economy">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">10. Economy & Trading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Gold & Profits</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Regular 2–3★ trades (lower risk, plannable profit)</li>
                    <li>Farm spots with high <em>mob density</em> + low potion quota</li>
                    <li>List drops/elixirs/stones in stall at peak times</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Stall Principles</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Watch prices (screenshots/notes), avoid under/overpricing</li>
                    <li>Bundle sales (elixirs/stones) work better than single items</li>
                    <li>Use event windows (demand spikes)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Stall Network & Consignment</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Stall Network</strong>: List items without being online; note fee; use peak times</li>
                  <li><strong>Consignment</strong>: Specialty goods server-wide; can trigger job events</li>
                  <li><strong>Silk Items</strong>: Premium/VIP (EXP/SP bonuses), pets, inventory expansions, alchemy backups</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fortress War */}
        <section id="fortress">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">11. Fortress War (Guild Endgame)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Guilds fight for fortresses (e.g., Jangan/Hotan) – winner gets prestige, <em>tax income</em>, and strategic advantages. Structure: outer walls, gates, watchtowers, barricades, heart. Roles: attackers break through → destroy heart; defenders repair/hold positions.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Preparation</h3>
                  <p className="text-sm text-muted-foreground">Shift setup (frontline, flanker, utility), alchemy buff food, speed drugs, flags</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Attack</h3>
                  <p className="text-sm text-muted-foreground">Synchronized battering ram pushes, tower focus, port cuts, secure respawn points</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Defense</h3>
                  <p className="text-sm text-muted-foreground">Gate rotation (repair), anti-wizard screens, retreat markers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Endgame */}
        <section id="endgame">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">12. Endgame (Lv. 110+ Cap)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">PvP (Fortress War, Guild Wars)</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Fortress War</strong>: Time window battles; organization & target calls beat raw gear score</li>
                  <li><strong>Guild Wars</strong>: Open battles; train buff sync & focus targets</li>
                </ul>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">High-Level Builds</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>EU</strong>: Warrior/Cleric as anchor; Wizard stacks; Warlock debuffs; Bard songs</li>
                  <li><strong>CH</strong>: Spear INT nuker (Lightning/Cold), Glaive STR front, Bow kite (Fire/Light)</li>
                </ul>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Rare Items & Dungeons</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Alexandria</strong> → Temple & Job Temple Uniques: coins/materials for EGY/Nova sets</li>
                  <li><strong>Jupiter Temple</strong>: High-end instances (server-dependent)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tips */}
        <section id="tips">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">13. Tips & Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Quick Check</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Solo</strong>: Safe builds, consistent spots, moderate alchemy</li>
                    <li><strong>Party</strong>: Clarify roles (heals/taunts/bursts), spawn kiting</li>
                    <li><strong>Job</strong>: Increase stars slowly; thief activity server-dependent</li>
                    <li><strong>Fortress</strong>: Discord mandatory, clear calls, respawn points</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">External Sources</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Wiki (Fandom): World map & cities</li>
                    <li>Job system overview</li>
                    <li>Interactive world map</li>
                    <li>Alchemy videos (elixirs/stones)</li>
                    <li>Jobbing videos (iSRO)</li>
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

export default BeginnerGuide;
