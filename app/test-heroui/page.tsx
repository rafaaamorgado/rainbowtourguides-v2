'use client';

import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';

export default function TestHeroUIPage() {
  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">
        HeroUI Integration Test
      </h1>

      <div className="space-y-8">
        {/* Button Test */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Button Components</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <Button color="default">Default Button</Button>
              <Button color="primary">Primary Button</Button>
              <Button color="secondary">Secondary Button</Button>
              <Button color="success">Success Button</Button>
              <Button color="warning">Warning Button</Button>
              <Button color="danger">Danger Button</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button variant="solid">Solid</Button>
              <Button variant="bordered">Bordered</Button>
              <Button variant="light">Light</Button>
              <Button variant="flat">Flat</Button>
              <Button variant="faded">Faded</Button>
              <Button variant="shadow">Shadow</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </CardBody>
        </Card>

        {/* Input Test */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Input Components</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
              />
              <Input
                type="text"
                label="Name"
                placeholder="Enter your name"
                variant="bordered"
              />
              <Input
                type="text"
                label="Username"
                placeholder="@username"
                variant="flat"
              />
            </div>
          </CardBody>
        </Card>

        {/* Card Test */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Card Variants</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card shadow="sm">
                <CardBody>
                  <p>Small Shadow</p>
                </CardBody>
              </Card>
              <Card shadow="md">
                <CardBody>
                  <p>Medium Shadow</p>
                </CardBody>
              </Card>
              <Card shadow="lg">
                <CardBody>
                  <p>Large Shadow</p>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-semibold text-lg">
            ✓ If you see styled HeroUI components above, the integration is
            successful!
          </p>
          <p className="text-green-600 mt-2 text-sm">
            All components should have proper theming, colors, and animations.
          </p>
        </div>
      </div>
    </div>
  );
}
