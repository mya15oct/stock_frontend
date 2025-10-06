import Link from 'next/link'
import { Card } from '@/components/ui/Card'

interface ToolsLayoutProps {
  children: React.ReactNode
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  const toolsNavigation = [
    {
      name: 'Dividend Calendar',
      href: '/tools/dividend-calendar',
      description: 'View upcoming dividend payment dates',
      icon: '💰'
    },
    {
      name: 'Ex-Dividend Calendar',
      href: '/tools/ex-dividend-calendar',
      description: 'Track ex-dividend dates for planning',
      icon: '📅'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investment Tools</h1>
        <p className="text-gray-600">Powerful tools to help you make informed investment decisions</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toolsNavigation.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <div>
                    <h3 className="font-semibold">{tool.name}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <div>{children}</div>
    </div>
  )
}
