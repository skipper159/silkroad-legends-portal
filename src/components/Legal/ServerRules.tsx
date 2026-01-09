import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/context/ThemeContext';

const ServerRules = () => {
  const { currentTemplate, theme } = useTheme();
  const { Layout } = currentTemplate.components;
  return (
    <Layout>
      <div
        className='py-12 bg-cover bg-center'
        style={{
          backgroundImage: `url('${currentTemplate.assets.pageHeaderBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <div className='bg-black/50 p-6 rounded-lg inline-block backdrop-blur-sm'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white'>
              Server Rules <span className='text-lafftale-bronze font-cinzel text-4xl font-bold'>{theme.siteName}</span>
            </h1>
            <p className='text-lg max-w-2xl mx-auto mb-10 text-gray-200'>
              Please read the rules carefully to ensure a fair and enjoyable experience for everyone.
            </p>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='bg-destructive/10 p-6 rounded-lg border border-lafftale-gold'>
          <ul className='list-decimal list-inside space-y-4 text-muted-foreground'>
            <li>The use or promotion of bots is forbidden and the player account(s) will be permanently banned.</li>

            <li>
              The use or promotion of automation tools such as keypressers is forbidden or any 3rd party tool that gives
              the player an unfair advantage into the game is forbidden. Repeated offenses will lead to an account ban
              at Game Master's discretion. For a full list of forbidden tools Click here
            </li>

            <li>
              The use or promotion of cheat tools such as debug tools, cheat engine or any attempt to edit the game
              files or game memory is forbidden.
            </li>

            <li>The game can only run on a real Windows Machine. Use of any kind of Virtual machines is forbidden.</li>

            <li>
              Being frequently AFK (Away from your computer) in events like Capture the Flag, Battle Arena and others
              just to farm items is not allowed. If you are not going to play in the events, do not register.
            </li>

            <li>Promotion, mention or asking of other servers in general is forbidden.</li>

            <li>Buying or Selling items, gold, silk for real money is forbidden.</li>

            <li>Buying or Selling game accounts is forbidden.</li>

            <li>Selling/Trading items/accounts/silk/gold from another game/server is forbidden.</li>

            <li>
              Do not share your ID or password with anyone, never use a password that was used in other games, setup a
              strong unique password. Complaints about hacked accounts won't get any support from the staff. It is your
              responsibility to keep your account info safe.
            </li>

            <li>
              Respect staff members. Any offense, false accusations, spreading false information, spreading negativity,
              bad words against the staff/server will get your account banned. Even if it's a joke. There is no excuse.
            </li>

            <li>No racism at all is allowed.</li>

            <li>Impersonating a staff member will get your account banned.</li>

            <li>
              Use of temporary or disposable email for account registration is not allowed, the account will be
              terminated without prior notice.
            </li>

            <li>
              Bug or exploit abusers will get punished according to the severity of it. If you find such things, please
              report it to Game masters directly at the forum via Private message.
            </li>

            <li>
              Invalid names: Offensive, Racist, promoting another server, or illegal program, or staff impersonating
              names. Also any other name that the Origin Staff considers as invalid.
            </li>

            <li>
              The staff is not responsible for player mistakes, such as buying the wrong item, getting scammed by other
              players, alchemy mistakes, charging silk to the wrong server and such. The player will not get any type of
              support on these cases.
            </li>

            <li>
              Your account is your responsibility. Excuses like, someone else was using your account, "I was Joking" or
              you didn't read the rules are not valid.
            </li>

            <li>
              No discussions about politics, conflicting nations/groups or religion topics in global chat, general chat
              or any other public means. This is not the place for such discussions.
            </li>

            <li>
              No posting of illegal images/video or any type of talk or accusations of account buying/selling or
              gold/items, buying selling for real money or use of illegal tools in global messages or in any other way
              in-game. If you have proof of such things, report at the forums.
            </li>

            <li>
              Sexually explicit expressions are forbidden, specially those directed to family members, countries,
              religions. As well as using sexual orientations for the purpose of making fun of someone. Please be
              respectful to your fellow players.
            </li>

            <li>Job abuse. As described here.</li>

            <li>
              Any other behavior that is considered inappropriate by Game Masters could also lead to account suspension
              or ban.
            </li>

            <li>
              Game Masters have the last word. It is their decision to judge and apply restrictions in the game
              according to the rules written here and their judgement.
            </li>

            <li>
              Players are allowed exchange Gold/Silk/Items between themselves and only between Origin Online servers
              (Not foreign Servers) However, we do not recommend it. You could get scammed by another player at any
              time. Do it at your own risk. The Origin Staff does not provide any type of support if you get scammed.
              Please be careful while doing these type of transactions.
            </li>

            <li>Origin Online Does not any official have Discord/Whatsapp/Facebook groups or other platforms.</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ServerRules;
