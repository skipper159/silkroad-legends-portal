import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ServerGuide = () => {
  return (
    <>
      <Navbar />

      <div className="py-12 bg-header-bg bg-cover bg-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Server Guide <span className="text-lafftale-bronze font-cinzel text-4xl font-bold">Lafftale</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 text-gray-300">
            Everything you need to know about our server specifications and features
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Server Information */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Server Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">Basic Specs</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Level Cap:</strong> 110</li>
                    <li><strong>Experience Rate:</strong> Custom</li>
                    <li><strong>Gold Rate:</strong> Custom</li>
                    <li><strong>Drop Rate:</strong> Custom</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">Server Features</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Active GM Support</li>
                    <li>✓ Regular Events</li>
                    <li>✓ Anti-Bot Protection</li>
                    <li>✓ Balanced Economy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Download & Registration */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Download & Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                  <li>Register your account on our website</li>
                  <li>Download the game client</li>
                  <li>Install and patch the game</li>
                  <li>Launch the game and log in with your credentials</li>
                  <li>Create your character and start playing!</li>
                </ol>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm">
                  <strong>Note:</strong> Make sure to read the server rules before playing to ensure a fair and enjoyable experience for everyone.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Job System Details */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Job System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Trader</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Trading starts at Level 20</li>
                    <li>All star ratings available (1★-5★)</li>
                    <li>Special trading events weekly</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Hunter</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Hunter job starts at Level 20</li>
                    <li>Bounty rewards balanced</li>
                    <li>Guild hunter teams encouraged</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Thief</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Thief job starts at Level 20</li>
                    <li>Karma system active</li>
                    <li>Special thief hideouts available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Events & Community */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Events & Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Regular Events</h3>
                <p className="text-muted-foreground mb-4">
                  We host various events throughout the week to keep the community engaged and reward our players.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Weekly Fortress Wars</li>
                  <li>Special trading events</li>
                  <li>GM-hosted boss hunts</li>
                  <li>Seasonal tournaments</li>
                  <li>Double EXP weekends</li>
                </ul>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Community Links</h3>
                <p className="text-muted-foreground">
                  Join our community channels to stay updated, find parties, and connect with other players.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Technical Support */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Technical Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Common Issues</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Can't connect to the server?</h4>
                    <p className="text-sm text-muted-foreground">Check your firewall settings and ensure the game is allowed through.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Game crashes on startup?</h4>
                    <p className="text-sm text-muted-foreground">Run the game as administrator and update your graphics drivers.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Lost your password?</h4>
                    <p className="text-sm text-muted-foreground">Use the password recovery feature on the login page.</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm">
                  <strong>Need more help?</strong> Contact our support team through the support ticket system or join our Discord for live assistance.
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

export default ServerGuide;
