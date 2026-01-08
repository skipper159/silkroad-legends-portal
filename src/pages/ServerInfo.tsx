import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActiveTemplate from '@/config/theme-config';

const { Layout } = ActiveTemplate.components;

const ServerInfo: FC = () => {
  const [serverTime, setServerTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const serverDate = new Date();
      serverDate.setHours(serverDate.getUTCHours() + 1); // GMT+1

      const formattedTime = new Intl.DateTimeFormat(navigator.language, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(serverDate);

      setServerTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div
        className='py-12 bg-cover bg-center'
        style={{
          backgroundImage: `url('${ActiveTemplate.assets.pageHeaderBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
            Server Specs <span className='text-theme-accent font-cinzel text-4xl font-bold'>Lafftale</span>
          </h1>
          <p className='text-lg max-w-2xl mx-auto mb-10 text-theme-text-muted'>
            Dive into the golden era of Silkroad Online, reimagined on our private server Lafftale – for true veterans
            and new explorers alike. Here you'll find a carefully balanced gameplay experience that stays true to the
            classic SRO version, enhanced with modern features and fair mechanics.
          </p>
        </div>
      </div>
      <hr></hr>

      <div className='container mx-auto py-10'>
        <h1 className='text-4xl font-bold text-center mb-8'>Server Information & Rules</h1>

        <Tabs defaultValue='general' className='w-full '>
          <TabsList className='grid w-full grid-cols-2 md:grid-cols-4'>
            <TabsTrigger value='general'>General Info</TabsTrigger>
            <TabsTrigger value='rules'>Server Rules</TabsTrigger>
            <TabsTrigger value='fortress'>Fortress War</TabsTrigger>
            <TabsTrigger value='events'>Events</TabsTrigger>
          </TabsList>

          <TabsContent value='general'>
            <Card className='border-theme-primary/30 mb-6'>
              <CardHeader>
                <CardTitle>General Server Information</CardTitle>
                <CardDescription>Important details about our server</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='bg-destructive/10 p-4 rounded-lg'>
                    <h3 className='text-xl font-semibold mb-4'>Server Status</h3>
                    <ul className='space-y-2'>
                      <li className='flex justify-between'>
                        <span>Players Online:</span>
                        <span className='font-medium'>0 / 3000</span>
                      </li>
                      <li className='flex justify-between'>
                        <span>Supporters Online:</span>
                        <span className='font-medium'>0 / 0</span>
                      </li>
                      <li className='flex justify-between'>
                        <span>Server Time:</span>
                        <span className='font-medium'>{serverTime}</span>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-destructive/10 p-4 rounded-lg'>
                    <h3 className='text-xl font-semibold mb-4'>Server Details</h3>
                    <ul className='space-y-2'>
                      <li className='flex justify-between'>
                        <span>Cap:</span>
                        <span className='font-medium'>100</span>
                      </li>
                      <li className='flex justify-between'>
                        <span>Races:</span>
                        <span className='font-medium'>Chinese</span>
                      </li>
                      <li className='flex justify-between'>
                        <span>Guild Limit:</span>
                        <span className='font-medium'>32</span>
                      </li>
                      <li className='flex justify-between'>
                        <span>Union Limit:</span>
                        <span className='font-medium'>2</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className='bg-destructive/10 p-6 rounded-lg'>
                  <h3 className='text-xl font-semibold mb-4'>About Lafftale Online</h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    Welcome to Lafftale Online! Our server offers a classic Silkroad experience with modern
                    improvements. We place great emphasis on fair gameplay and a friendly community. Our dedicated
                    administrators and moderators are always ready to help.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='rules'>
            <Card className='border-theme-primary/30 mb-6'>
              <CardHeader>
                <CardTitle>Server Rules & Policies</CardTitle>
                <CardDescription>By registering, you agree to these rules</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='bg-destructive/10 p-6 rounded-lg'>
                  <p className='text-muted-foreground mb-4'>
                    Violations of these rules may result in the following actions:
                  </p>
                  <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                    <li>Temporary account suspension</li>
                    <li>Permanent account termination</li>
                    <li>Permanent IP & HWID ban</li>
                    <li>Ban on all associated accounts</li>
                  </ul>
                </div>

                <div className='space-y-6'>
                  <div className='border-[0.5px] border-theme-primary/20 rounded-lg p-4'>
                    <h3 className='text-xl font-semibold mb-2'>1. Selling Silk Items</h3>
                    <p className='text-muted-foreground mb-2'>
                      Selling silk items/accounts or cross-server trading is forbidden.
                    </p>
                    <div className='bg-destructive/10 p-3 rounded mt-2'>
                      <h4 className='font-medium'>First Offense:</h4>
                      <ul className='list-disc list-inside text-sm text-muted-foreground'>
                        <li>Permanent account termination</li>
                        <li>IP & HWID ban</li>
                        <li>All associated accounts banned</li>
                        <li>Character name blacklisted</li>
                      </ul>
                    </div>
                  </div>

                  <div className='border-[0.5px] border-theme-primary/20 rounded-lg p-4'>
                    <h3 className='text-xl font-semibold mb-2'>2. Bug Abuse</h3>
                    <p className='text-muted-foreground mb-2'>Intentionally exploiting game bugs is prohibited.</p>
                    <div className='bg-destructive/10 p-3 rounded mt-2'>
                      <h4 className='font-medium'>First Offense:</h4>
                      <p className='text-sm text-muted-foreground'>Ban duration at Admin's discretion</p>
                    </div>
                  </div>

                  <div className='border-[0.5px] border-theme-primary/20 rounded-lg p-4'>
                    <h3 className='text-xl font-semibold mb-2'>3. Advertisements</h3>
                    <p className='text-muted-foreground mb-2'>Promoting other servers is forbidden.</p>
                    <div className='bg-destructive/10 p-3 rounded mt-2'>
                      <h4 className='font-medium'>First Offense:</h4>
                      <ul className='list-disc list-inside text-sm text-muted-foreground'>
                        <li>Permanent account termination</li>
                        <li>IP & HWID ban</li>
                        <li>All associated accounts banned</li>
                        <li>Character name blacklisted</li>
                      </ul>
                    </div>
                  </div>

                  <div className='border-[0.5px] border-theme-primary/20 rounded-lg p-4'>
                    <h3 className='text-xl font-semibold mb-2'>4. Account Hacking</h3>
                    <p className='text-muted-foreground mb-2'>Unauthorized account access is prohibited.</p>
                    <div className='bg-destructive/10 p-3 rounded mt-2'>
                      <h4 className='font-medium'>First Offense:</h4>
                      <ul className='list-disc list-inside text-sm text-muted-foreground'>
                        <li>Permanent account termination</li>
                        <li>IP & HWID ban</li>
                        <li>All associated accounts banned</li>
                        <li>Character name blacklisted</li>
                      </ul>
                    </div>
                  </div>

                  <div className='border-[0.5px] border-theme-primary/20 rounded-lg p-4'>
                    <h3 className='text-xl font-semibold mb-2'>5. Provocative Behavior</h3>
                    <p className='text-muted-foreground mb-2'>Spreading rumors or harassing staff is prohibited.</p>
                    <div className='bg-destructive/10 p-3 rounded mt-2'>
                      <h4 className='font-medium'>First Offense:</h4>
                      <ul className='list-disc list-inside text-sm text-muted-foreground'>
                        <li>Permanent account termination</li>
                        <li>IP & HWID ban</li>
                        <li>All associated accounts banned</li>
                        <li>Character name blacklisted</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='fortress'>
            <Card className='border-theme-primary/30 mb-6'>
              <CardHeader>
                <CardTitle>Fortress War</CardTitle>
                <CardDescription>Information about Fortress Wars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='bg-destructive/10 p-6 rounded-lg'>
                  <h3 className='text-xl font-semibold mb-4'>Fortress Battle Times</h3>
                  <ul className='space-y-2'>
                    <li className='flex justify-between'>
                      <span>Registration:</span>
                      <span className='font-medium'>Sunday 12:00 - 20:00</span>
                    </li>
                    <li className='flex justify-between'>
                      <span>Battle:</span>
                      <span className='font-medium'>Sunday 21:00</span>
                    </li>
                  </ul>

                  <div className='mt-6'>
                    <h4 className='font-semibold mb-2'>Participation Requirements:</h4>
                    <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                      <li>Minimum Guild Level 5</li>
                      <li>At least 8 guild members</li>
                      <li>Registration fee: 10,000,000 Gold</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='events'>
            <Card className='border-theme-primary/30 mb-6'>
              <CardHeader>
                <CardTitle>Server Events</CardTitle>
                <CardDescription>Regular events on our server</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='bg-destructive/10 p-4 rounded-lg'>
                    <h3 className='text-xl font-semibold mb-4'>Daily Events</h3>
                    <ul className='space-y-2'>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>Capture the Flag</span>
                        <p className='text-sm text-muted-foreground'>Daily at 19:00</p>
                      </li>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>Job War</span>
                        <p className='text-sm text-muted-foreground'>Daily at 21:00</p>
                      </li>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>Dungeon Challenge</span>
                        <p className='text-sm text-muted-foreground'>Daily at 14:00</p>
                      </li>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>PvP Event</span>
                        <p className='text-sm text-muted-foreground'>Daily at 21:00</p>
                      </li>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>Survival Arena</span>
                        <p className='text-sm text-muted-foreground'>Daily at 21:00</p>
                      </li>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>Battle Arena (Score)</span>
                        <p className='text-sm text-muted-foreground'>Daily at 21:00</p>
                      </li>
                      <li className='font-medium'>
                        <span className='font-medium'>Battle Arena (Flag)</span>
                        <p className='text-sm text-muted-foreground'>Daily at 21:00</p>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-destructive/10 p-4 rounded-lg'>
                    <h3 className='text-xl font-semibold mb-4'>Weekly Events</h3>
                    <ul className='space-y-2'>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>Unique Hunt</span>
                        <p className='text-sm text-muted-foreground'>Saturday at 20:00</p>
                      </li>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>Treasure Hunt</span>
                        <p className='text-sm text-muted-foreground'>Wednesday at 18:00</p>
                      </li>
                      <li className='border-b pb-2'>
                        <span className='font-medium'>ROC Event</span>
                        <p className='text-sm text-muted-foreground'>Saturday at 19:00</p>
                      </li>
                      <li>
                        <span className='font-medium'>Guild Challenge</span>
                        <p className='text-sm text-muted-foreground'>Friday at 19:00</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ServerInfo;
