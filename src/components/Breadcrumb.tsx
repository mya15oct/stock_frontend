import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  country?: string
  sector?: string
  companyName?: string
  ticker?: string
  customItems?: BreadcrumbItem[]
}

export default function Breadcrumb({
  country = "United States",
  sector,
  companyName,
  ticker,
  customItems
}: BreadcrumbProps) {
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems
    }

    const items: BreadcrumbItem[] = [
      {
        label: "Stocks",
        href: "/"
      }
    ]

    if (country) {
      items.push({
        label: country,
        href: `/stocks?country=${encodeURIComponent(country.toLowerCase())}`
      })
    }

    if (sector) {
      items.push({
        label: sector,
        href: `/stocks?sector=${encodeURIComponent(sector.toLowerCase())}`
      })
    }

    if (companyName) {
      items.push({
        label: companyName,
        href: ticker ? `/stocks/${ticker}` : undefined,
        active: true
      })
    }

    return items
  }

  const breadcrumbItems = generateBreadcrumbItems()

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}

            {item.href && !item.active ? (
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {index === 0 && (
                  <svg
                    className="w-3 h-3 mr-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                )}
                {item.label}
              </Link>
            ) : (
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  item.active
                    ? 'text-gray-500 cursor-default'
                    : 'text-gray-700'
                }`}
              >
                {index === 0 && !item.href && (
                  <svg
                    className="w-3 h-3 mr-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export { type BreadcrumbItem, type BreadcrumbProps }
