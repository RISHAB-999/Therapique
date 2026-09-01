import React from 'react'
import { SplitTextReveal, FadeUp } from './ScrollReveal'

// Helper to reliably capitalize each word in titles (e.g., "mental health" -> "Mental Health")
const formatTitleCase = (str) => {
    if (!str || typeof str !== 'string') return str
    return str
        .split(' ')
        .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
        .join(' ')
}

const Title = ({ 
    title1, 
    title2, 
    titleStyles = '', 
    title1Styles = '', 
    paraStyles = '', 
    para 
}) => {
    const formattedTitle1 = formatTitleCase(title1)
    const formattedTitle2 = formatTitleCase(title2)

    return (
        <div className={titleStyles}>
            <h3 className={`${title1Styles} font-therapique text-2xl sm:text-3xl md:text-4xl text-gray-900 tracking-tight leading-tight capitalize flex flex-wrap items-baseline gap-x-2`}>
                <SplitTextReveal text={formattedTitle1} className="font-bold" />
                {formattedTitle2 && (
                    <SplitTextReveal 
                        text={formattedTitle2} 
                        delay={0.12}
                        className="font-normal underline decoration-gray-400 underline-offset-4" 
                    />
                )}
            </h3>
            <FadeUp delay={0.2}>
                <p className={`${paraStyles} text-xs sm:text-sm text-gray-600 max-w-md mt-2 font-medium leading-relaxed`}>
                    {para ? para : "Discover books that spark curiosity, deliver quality and bring inspiration to your everyday reading"}
                </p>
            </FadeUp>
        </div>
    )
}

export default Title