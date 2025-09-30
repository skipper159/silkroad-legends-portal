import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
            Structured, practical guide with visual aids. Everything you need to know to get started.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Table of Contents */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Table of Contents</CardTitle>
            <CardDescription>Quick navigation to all guide sections</CardDescription>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" aria-label="Table of Contents">
              <a href="#intro" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                1. Introduction
              </a>
              <a href="#start" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                2. Getting Started
              </a>
              <a href="#leveling" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                3. Leveling Routes
              </a>
              <a href="#mastery" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                4. Mastery Guide
              </a>
              <a href="#job" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                5. Job System
              </a>
              <a href="#alchemy" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                6. Equipment & Alchemy
              </a>
              <a href="#grinding" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                7. Grinding Spots
              </a>
              <a href="#dungeons" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                8. Dungeons & Special Content
              </a>
              <a href="#economy" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                9. Economy & Trading
              </a>
              <a href="#endgame" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                10. Endgame
              </a>
              <a href="#crafting" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                Crafting/Manufacturing
              </a>
              <a href="#fortress" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                Fortress War
              </a>
              <a href="#tips" className="block bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors">
                Tips & Resources
              </a>
            </nav>
          </CardContent>
        </Card>
        {/* 1. Introduction */}
        <section id="intro" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">1. Introduction</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <p className="leading-relaxed mb-4">
                <strong>Silkroad Online</strong> is a classic MMORPG by Joymax, famous for the <em>Triangular Conflict</em> 
                between <strong>Trader</strong>, <strong>Hunter</strong>, and <strong>Thief</strong> (PvP economy) and for 
                the guild endgame <strong>Fortress War</strong>. The world spans from China through Central Asia to Europe.
              </p>
              <div className="bg-primary/5 border-l-4 border-primary pl-4 py-3 mb-4">
                <p className="text-sm">
                  Historical: The game thematically focuses on the trade routes of the historic <em>Silk Road</em> – 
                  cities, caravans, and bandits included.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-card border border-border rounded-full text-sm">F2P</span>
                <span className="px-3 py-1 bg-card border border-border rounded-full text-sm">PvE + PvP</span>
                <span className="px-3 py-1 bg-card border border-border rounded-full text-sm">Caravans</span>
                <span className="px-3 py-1 bg-card border border-border rounded-full text-sm">Guild Wars</span>
              </div>
            </Card>
            <figure className="bg-card border border-border rounded-lg p-4">
              <img 
                src="https://static.wikia.nocookie.net/silkroad/images/c/c0/Silkroad_World_Map3.jpg/revision/latest/scale-to-width-down/1200" 
                alt="World Map of Silkroad Online" 
                className="w-full rounded-lg"
              />
              <figcaption className="text-sm text-muted-foreground mt-2">
                World Map (Source: Silkroad Online Wiki / Fandom – CC-BY-SA)
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 2. Getting Started */}
        <section id="start" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">2. Getting Started & Characters</h2>
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">China vs. Europe (short & honest)</h3>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li><strong>China</strong>: Solid solo classes, simple potion rotation, strong 1v1 scaling, flexible hybrid builds.</li>
              <li><strong>Europe</strong>: Party-strong (buff synergies), clear roles (e.g. Wizard/Cleric, Warrior/Cleric), somewhat more demanding solo.</li>
            </ul>
            <p className="bg-primary/10 p-3 rounded-lg">
              <strong>Recommendation for newcomers:</strong> CH Glaive (STR) or EU Warrior/Cleric – forgiving mistakes, stable farming.
            </p>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">First Steps</h3>
              <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Main Story & City Quests (additional EXP + Gold)</li>
                <li>Set Auto-Potion cleanly (HP 80%, MP 60%, Return Scrolls ready)</li>
                <li>Upgrade gear <em>step by step</em> – no expensive experiments early</li>
              </ol>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Quality of Life</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Use Griffin/Transport Pets (loot comfort, carry capacity)</li>
                <li>Monitor Stall Network (develop price sense)</li>
                <li>Find Guild – for buffs, Fortress & Caravans</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* 3. Leveling Routes */}
        <section id="leveling" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">3. Level Routes (1–40)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Proven Hunting Grounds</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><strong>1–10</strong>: Starting zones around <em>Jangan</em>/<em>Constantinople</em> (Mangyang → avoid Tiger Girl 😉)</li>
                <li><strong>10–20</strong>: Bandits/Hyongchas (Donwhang area)</li>
                <li><strong>20–30</strong>: Ongs / Penons – dense spawn, good EXP/HP ratio</li>
                <li><strong>30–40</strong>: Sonkar/Isy areas (careful), Hyeongcheons, Earth Ghosts</li>
              </ul>
              <p className="text-sm bg-primary/10 p-3 rounded-lg mt-4">
                Solo → Focus on dense spawn fields. In party → Wizard/Cleric train rocks spots very efficiently.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Equipment</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>NPC gear only as <em>interim solution</em>; better: drops & cheap +3/+4 at stall</li>
                <li>Prioritize weapons (DPS scales EXP/h strongest)</li>
                <li>Blues: <em>Durability</em>, <em>Attack/Parry</em>, situationally <em>STR/INT</em></li>
              </ul>
            </Card>
          </div>
        </section>

        {/* 4. Mastery Guide */}
        <section id="mastery" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">4. Mastery Guide</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Mastery Limits & Stat Distributions</h3>
              <p className="text-muted-foreground mb-4">
                Chinese builds combine <em>Weapon</em> (Bicheon/Heuksal/Pacheon) and <em>Element Masteries</em> (Fire/Cold/Light/Force). 
                Europeans play fixed classes (Wizard/Cleric/…); sub-skills complement the role. Classic distributions:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Pure STR</strong> – maximum physical damage/HP; tanks & melee fighters</li>
                <li><strong>Pure INT</strong> – maximum magical damage/MP; nukers & casters</li>
                <li><strong>Hybrid 2:1</strong> – e.g. <code>2 INT : 1 STR</code> or vice versa; balanced for solo PvE</li>
              </ul>
              <div className="bg-card border border-border rounded-lg p-4 mt-4">
                <svg viewBox="0 0 520 120" width="100%" height="auto">
                  <rect x="10" y="30" width="500" height="20" fill="hsl(var(--muted))" rx="6"></rect>
                  <rect x="10" y="30" width="334" height="20" fill="hsl(var(--primary))" rx="6"></rect>
                  <text x="10" y="25" fill="hsl(var(--muted-foreground))" fontSize="14">Example Hybrid 2:1 INT:STR (≈ 66% INT / 34% STR)</text>
                  <text x="260" y="65" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14">INT</text>
                  <text x="440" y="65" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14">STR</text>
                </svg>
              </div>
              <p className="text-sm bg-primary/10 p-3 rounded-lg mt-4">
                Server caps change mastery maximum values (e.g. 300/330/360/440 points). Check the <em>current cap</em> of your iSRO server.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recommended Builds (PvE/PvP)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Race</th>
                      <th className="text-left p-2">Build</th>
                      <th className="text-left p-2">PvE</th>
                      <th className="text-left p-2">PvP</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="p-2">CH</td>
                      <td className="p-2">Bow + Lightning + Fire</td>
                      <td className="p-2">★★★★★</td>
                      <td className="p-2">★★★☆☆</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">CH</td>
                      <td className="p-2">Spear + Lightning + Cold</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★★☆</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">CH</td>
                      <td className="p-2">Glaive + Fire + Lightning</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★★☆</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">EU</td>
                      <td className="p-2">Wizard / Cleric</td>
                      <td className="p-2">★★★★★</td>
                      <td className="p-2">★★★☆☆</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">EU</td>
                      <td className="p-2">Warrior / Cleric</td>
                      <td className="p-2">★★★★☆</td>
                      <td className="p-2">★★★★★</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-2">EU</td>
                      <td className="p-2">Warlock / Cleric</td>
                      <td className="p-2">★★★☆☆</td>
                      <td className="p-2">★★★★☆</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. Job System */}
        <section id="job" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">5. Job System (from Lv. 20)</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <p className="text-muted-foreground mb-4">
                From level 20 you freely choose a role: <strong>Trader</strong> (transport goods), <strong>Hunter</strong> (protect) 
                or <strong>Thief</strong> (raid). Star goods (1–5★) → more profit, but stronger NPC/player thieves. 
                <em>Safe Trade</em> exists (lower profit, barely PvP risk).
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Trader:</strong> Buys specialty goods, uses transport (donkey/camel/ox etc.), sells in another city for profit</li>
                <li><strong>Hunter:</strong> Joins traders, hunts thieves, receives bounty/job EXP</li>
                <li><strong>Thief:</strong> Attacks traders, steals goods, sells in hideouts; observe karma system</li>
              </ul>
            </Card>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Triangular Conflict (Schema)</h3>
              <svg viewBox="0 0 600 340" role="img" aria-label="Trader-Hunter-Thief Triangle" width="100%" height="auto">
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L6,3 z" fill="currentColor" />
                  </marker>
                </defs>
                <g fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <polygon points="300,40 80,290 520,290" />
                  <text x="300" y="30" textAnchor="middle" fill="hsl(var(--primary))" fontSize="18">Hunter</text>
                  <text x="60" y="310" fill="hsl(var(--chart-2))" fontSize="18">Trader</text>
                  <text x="520" y="310" textAnchor="end" fill="hsl(var(--destructive))" fontSize="18">Thief</text>
                  <line x1="90" y1="280" x2="510" y2="280" stroke="hsl(var(--muted-foreground))" markerEnd="url(#arrow)" />
                  <line x1="510" y1="280" x2="300" y2="60" stroke="hsl(var(--muted-foreground))" markerEnd="url(#arrow)" />
                  <line x1="300" y1="60" x2="90" y2="280" stroke="hsl(var(--muted-foreground))" markerEnd="url(#arrow)" />
                </g>
              </svg>
              <p className="text-sm text-muted-foreground mt-2">
                Trader → Profit, Hunter → Protection/Rewards, Thief → Raids/Loot. More stars = more risk/reward.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">First Trade – Step by Step</h3>
          <ol className="space-y-2 list-decimal list-inside text-muted-foreground mb-6">
            <li><strong>Choose job</strong> (Trader) at Merchant Associate from Lv. 20; equip <em>Job Suit</em></li>
            <li><strong>Summon transport</strong> (donkey/camel/wagon) & choose star rating of goods (1★ safe → 5★ risky)</li>
            <li>Route: <em>Jangan → Donwhang</em> (beginner); optionally find hunter party</li>
            <li>At destination sell at Specialty Trader → <strong>Gold + Job EXP</strong></li>
          </ol>

          <div className="grid md:grid-cols-2 gap-6">
            <figure className="bg-card border border-border rounded-lg p-4">
              <img 
                src="https://img.youtube.com/vi/neMQVw-zDbA/maxresdefault.jpg" 
                alt="iSRO Job Guide – Thumbnail" 
                className="w-full rounded-lg"
              />
              <figcaption className="text-sm text-muted-foreground mt-2">
                Video Guide (Thumbnail) on Jobbing in iSRO
              </figcaption>
            </figure>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Job Suits & Transports</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Trader Suit</strong> – Required for loading/selling; more slots with higher transport</li>
                <li><strong>Hunter Suit</strong> – Hunting clearance on thieves; defensive/HP relevant</li>
                <li><strong>Thief Suit</strong> – Access to hideouts/fences; karma colors (white/orange/red)</li>
                <li><strong>Transports</strong> – Donkey/camel/wagon; more stars ⇒ slower, but more profitable</li>
              </ul>
              <p className="text-sm bg-primary/10 p-3 rounded-lg mt-4">
                5★ only in coordination with Hunters/Voice. Solo: 1–2★, but regularly.
              </p>
            </Card>
          </div>
        </section>

        {/* 6. Equipment & Alchemy */}
        <section id="alchemy" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">6. Equipment & Alchemy</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Basic Principle</h3>
              <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                <li><em>Elixirs</em> (+ upgrade) + <em>Lucky Powder</em> (chance boost) → item plus</li>
                <li><em>Magic/Attribute Stones</em> → add blues/attributes (e.g. STR/INT, Durability, Attack/Parry)</li>
                <li>Higher the plus, higher the <em>fail chance</em> – play safe: stop at +5/+7 (server dependent)</li>
              </ol>
              <p className="text-sm bg-primary/10 p-3 rounded-lg mt-4">
                Important: Use higher Lucky Powder grades matching item degree. On fails, plus/stats can drop.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Practical Order</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Base blues first (Durability → Attack/Parry → STR/INT)</li>
                <li>Then Reinforce/Block etc. – depending on weapon/armor type</li>
                <li>+ push last, because expensive and risky</li>
              </ul>
            </Card>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Alchemy Flow Diagram</h3>
            <svg viewBox="0 0 900 220" width="100%" height="auto" role="img" aria-label="Alchemy Flow">
              <g fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                <rect x="20" y="20" width="180" height="60" rx="10"></rect>
                <text x="110" y="55" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14">Choose Item</text>
                <rect x="230" y="20" width="200" height="60" rx="10"></rect>
                <text x="330" y="55" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14">Elixir + Lucky Powder</text>
                <rect x="470" y="20" width="180" height="60" rx="10"></rect>
                <text x="560" y="55" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14">Fuse (Chance)</text>
                <rect x="680" y="20" width="200" height="60" rx="10"></rect>
                <text x="780" y="55" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14">Success → + rises</text>
                <path d="M200,50 L230,50" /><path d="M430,50 L470,50" /><path d="M650,50 L680,50" />
                <rect x="680" y="120" width="200" height="60" rx="10" stroke="hsl(var(--destructive))"></rect>
                <text x="780" y="155" textAnchor="middle" fill="hsl(var(--destructive))" fontSize="14">Fail → plus/stats may drop</text>
                <path d="M560,80 C560,110 650,110 780,120" stroke="hsl(var(--destructive))" />
              </g>
            </svg>
          </div>

          <figure className="bg-card border border-border rounded-lg p-4 mb-6">
            <img 
              src="https://img.youtube.com/vi/zNflGM1_3Ek/maxresdefault.jpg" 
              alt="YouTube – Silkroad Online Alchemy Guide Thumbnail" 
              className="w-full rounded-lg"
            />
            <figcaption className="text-sm text-muted-foreground mt-2">
              Video overview of Elixirs & Stones (YouTube Thumbnail, TweakMMO)
            </figcaption>
          </figure>

          <h3 className="text-xl font-semibold mb-4">Item Drops & SoX Grades</h3>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li><strong>Seal of Star (SoS)</strong> – roughly ≈ <em>+5 Level</em> over Normal</li>
            <li><strong>Seal of Moon (SoM)</strong> – roughly ≈ <em>+10 Level</em></li>
            <li><strong>Seal of Sun (SoSun)</strong> – roughly ≈ <em>+15 Level</em>, extremely rare</li>
          </ul>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Glow Orientation (classic)</h3>
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
                  <tr className="border-b border-border">
                    <td className="p-2">+9/+10</td>
                    <td className="p-2">turquoise/blue-green</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm bg-primary/10 p-3 rounded-lg mt-4">
              Server special glows from +11 possible. Push conservatively (secure → push → pause).
            </p>
          </Card>
        </section>

        {/* 7. Grinding Spots */}
        <section id="grinding" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">7. Grinding Spots & Party Play</h2>
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Best Spots (Traditional iSRO Routes)</h3>
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
                    <td className="p-2">Bandits (Jangan/Downhang)</td>
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
                  <tr className="border-b border-border">
                    <td className="p-2">80–100</td>
                    <td className="p-2">Jangan Cave / Roc Mountain</td>
                    <td className="p-2">PT friendly, solid drops</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <h3 className="text-xl font-semibold mb-4">Solo vs. Party</h3>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li><strong>Solo</strong>: Bow/Wizard/Rogue clear fastest; Blade/Warrior safer, but slower</li>
            <li><strong>Full PT (EU)</strong>: 2× Wizard, 1× Warlock, 1× Warrior, 1× Bard, 1–2× Cleric, 1× Rogue (Lure)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-4">Auto-Potion & Botting (Reality)</h3>
          <p className="text-muted-foreground">
            Use Auto-Potion in client (HP 80%, MP 60%, Vigor 50–60%). Bot density varies – play hotspots at off-peak times.
          </p>
        </section>

        {/* 8. Dungeons */}
        <section id="dungeons" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">8. Dungeons & Special Content</h2>
          <Card className="p-6 mb-6">
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Forgotten World (FGW)</strong>: Collect talismans (maps), boss runs; rewards for sets/weapons</li>
              <li><strong>Donwhang Cave</strong>, <strong>Qin-Shi Tomb</strong>, <strong>Jupiter Temple</strong>: Level-dependent group instances with robust drops</li>
              <li><strong>Uniques</strong>: World bosses (e.g. Tiger Girl, Isyutaru, Lord Yarkan) – keep track of timers/spawns</li>
            </ul>
          </Card>

          <h3 className="text-xl font-semibold mb-4">Forgotten World (Talisman Quest)</h3>
          <ol className="space-y-2 list-decimal list-inside text-muted-foreground mb-6">
            <li><strong>Find & destroy Dimension Pillar</strong> → <em>Envies</em> spawn</li>
            <li>Kill Envies → <strong>Dimension Hole</strong> drops (time limited)</li>
            <li>Use <em>Hole</em> in town → enter instance, collect talismans</li>
          </ol>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <figure className="bg-card border border-border rounded-lg p-4">
              <img 
                src="https://static.wikia.nocookie.net/silkroad/images/f/f7/Dimension_Hole.jpg/revision/latest/scale-to-width-down/400" 
                alt="Dimension Pillar/Red Crystal" 
                className="w-full rounded-lg"
              />
              <figcaption className="text-sm text-muted-foreground mt-2">Dimension Pillar (world object)</figcaption>
            </figure>
            <figure className="bg-card border border-border rounded-lg p-4">
              <img 
                src="https://static.wikia.nocookie.net/silkroad/images/4/4e/Envies_near_Dimension_Hole.jpg/revision/latest/scale-to-width-down/400" 
                alt="Envies at Dimension Hole" 
                className="w-full rounded-lg"
              />
              <figcaption className="text-sm text-muted-foreground mt-2">Envies after destroying pillar</figcaption>
            </figure>
            <figure className="bg-card border border-border rounded-lg p-4">
              <img 
                src="https://static.wikia.nocookie.net/silkroad/images/1/18/6.jpg/revision/latest/scale-to-width-down/400" 
                alt="Dimension Hole in town" 
                className="w-full rounded-lg"
              />
              <figcaption className="text-sm text-muted-foreground mt-2">Dimension Hole in town – instance access</figcaption>
            </figure>
          </div>

          <h3 className="text-xl font-semibold mb-4">Additional Content</h3>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li><strong>Roc Mountain</strong> – High-level area/boss; PT drops</li>
            <li><strong>Jangan Cave (Qin-Shi Tomb)</strong> – Multi-floor, 80–100+; PT friendly</li>
          </ul>
        </section>

        {/* 9. Economy */}
        <section id="economy" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">9. Economy & Trading</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Gold & Profits</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Regular 2–3★ trades (lower risk, predictable profit)</li>
                <li>Farm spots with high <em>mob density</em> + low potion ratio</li>
                <li>List drops/elixirs/stones in stall during peak times</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Stall Principles</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Monitor prices (screenshots/notes), avoid under/overpricing</li>
                <li>Bundle sales (elixirs/stones) work better than single items</li>
                <li>Use event windows (demand spikes)</li>
              </ul>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mb-4">Stall Network & Consignment</h3>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li><strong>Stall Network</strong>: List items without being online; note fees; use peak times</li>
            <li><strong>Consignment</strong>: Specialty goods server-wide; can trigger job events</li>
            <li><strong>Silk Items</strong>: Premium/VIP (EXP/SP bonuses), pets, inventory expansions, alchemy securities</li>
          </ul>
        </section>

        {/* 10. Endgame */}
        <section id="endgame" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">10. Endgame (Lv. 110+ Cap)</h2>
          <h3 className="text-xl font-semibold mb-4">PvP (Fortress War, Guild Wars)</h3>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li><strong>Fortress War</strong>: Timed battles; organization & target calls beat raw gear score</li>
            <li><strong>Guild Wars</strong>: Open battles; train buff sync & focus targets</li>
          </ul>

          <h3 className="text-xl font-semibold mb-4">High-Level Builds</h3>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li><strong>EU</strong>: Warrior/Cleric as anchor; Wizard stacks; Warlock debuffs; Bard songs</li>
            <li><strong>CH</strong>: Spear INT nuker (Lightning/Cold), Glaive STR front, Bow kite (Fire/Light)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-4">Rare Items & Dungeons</h3>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li><strong>Alexandria</strong> → Temple & Job Temple Uniques: Coins/materials for EGY/Nova sets</li>
            <li><strong>Jupiter Temple</strong>: High-end instances (server dependent)</li>
          </ul>
        </section>

        {/* Crafting */}
        <section id="crafting" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Crafting / Manufacturing</h2>
          <Card className="p-6">
            <p className="text-muted-foreground mb-4">
              Newer iSRO updates introduced a <strong>Manufacturing/Crafting system</strong>: collect/register recipes, 
              farm materials, craft chance-based (on fail materials are lost). This allows building special weapons/items.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Recipes</strong>: Drop from mobs/instances; must be registered in crafting UI</li>
              <li><strong>Materials</strong>: From drops, dismantle/salvage of gear, events</li>
              <li><strong>Success chance</strong>: Varies per item/grade; <em>fail destroys materials</em></li>
            </ul>
            <p className="text-sm bg-primary/10 p-3 rounded-lg mt-4">
              Practice: First skill/test cheap recipes, later craft expensive weapons. Balance material bottlenecks via guild/market.
            </p>
          </Card>
        </section>

        {/* Fortress War */}
        <section id="fortress" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Fortress War (Guild Endgame)</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <p className="text-muted-foreground mb-4">
                Guilds fight for fortresses (e.g. Jangan/Hotan) – winner receives prestige, <em>tax income</em> and strategic advantages. 
                Structure: outer walls, gates, watchtowers, barricades, heart. Roles: attackers break through → destroy heart; 
                defenders repair/hold positions.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Preparation</strong>: Shift setup (frontline, flanker, utility), alchemy buff food, speed drugs, flags</li>
                <li><strong>Attack</strong>: Synchronized ram pushes, tower focus, port cuts, secure respawn points</li>
                <li><strong>Defense</strong>: Gate rotation (repair), anti-wizard screens, retreat markers</li>
              </ul>
            </Card>
            <figure className="bg-card border border-border rounded-lg p-4">
              <img 
                src="https://img.youtube.com/vi/XY2TifBJbkg/maxresdefault.jpg" 
                alt="Fortress War – Hotan (YouTube Thumbnail)" 
                className="w-full rounded-lg"
              />
              <figcaption className="text-sm text-muted-foreground mt-2">
                Fortress War battles (YouTube Thumbnail). Practical insights into tactics & chaos.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Tips & Resources */}
        <section id="tips" className="border-t border-border pt-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Tips & Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Check</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Solo</strong>: Safe builds, consistent spots, moderate alchemy</li>
                <li><strong>Party</strong>: Clarify roles (heals/taunts/bursts), spawn kiting</li>
                <li><strong>Job</strong>: Increase stars slowly; thief activity server dependent</li>
                <li><strong>Fortress</strong>: Discord required, clear calls, respawn points</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">External Sources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Wiki (Fandom): <a href="https://silkroadonline.fandom.com/wiki/Map" target="_blank" rel="noopener" className="text-primary hover:underline">World Map & Cities</a></li>
                <li>Job System: <a href="https://silkroadonline.fandom.com/wiki/Job" target="_blank" rel="noopener" className="text-primary hover:underline">Job Wiki</a></li>
                <li>Interactive Map: <a href="https://jellybitz.github.io/xSROMap/" target="_blank" rel="noopener" className="text-primary hover:underline">xSROMap</a></li>
                <li>Alchemy Video: <a href="https://www.youtube.com/watch?v=zNflGM1_3Ek" target="_blank" rel="noopener" className="text-primary hover:underline">YouTube: TweakMMO</a></li>
                <li>Jobbing Video: <a href="https://www.youtube.com/watch?v=neMQVw-zDbA" target="_blank" rel="noopener" className="text-primary hover:underline">YouTube: Job Guide</a></li>
              </ul>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BeginnerGuide;
