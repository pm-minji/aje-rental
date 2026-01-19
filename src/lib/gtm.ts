export const GTM_ID = 'GTM-PLQSBK8B'

export const pageview = (url: string) => {
    if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
            event: 'pageview',
            page: url,
        })
    }
}

export const pushToDataLayer = (data: Record<string, any>) => {
    if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push(data)
    }
}

declare global {
    interface Window {
        dataLayer: any[]
    }
}
