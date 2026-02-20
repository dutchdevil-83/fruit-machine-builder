import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import enLocale from '../locales/en.json';
import nlLocale from '../locales/nl.json';

type TranslationDict = Record<string, string>;

const LOCALES: Record<string, TranslationDict> = {
    en: enLocale as TranslationDict,
    nl: nlLocale as TranslationDict,
};

const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    nl: 'Nederlands',
};

interface I18nContextValue
{
    locale: string;
    setLocale: ( locale: string ) => void;
    t: ( key: string, vars?: Record<string, string> ) => string;
    availableLocales: string[];
    languageName: ( code: string ) => string;
    browserLanguage: string;
    isBrowserLanguageAvailable: boolean;
}

const I18nContext = createContext<I18nContextValue | null>( null );

export function useTranslation (): I18nContextValue
{
    const ctx = useContext( I18nContext );
    if ( !ctx ) throw new Error( 'useTranslation must be used within <I18nProvider>' );
    return ctx;
}

/** Detect browser language, returning 2-letter code */
function detectBrowserLanguage (): string
{
    const nav = navigator.language || ( navigator as { userLanguage?: string } ).userLanguage || 'en';
    return nav.split( '-' )[ 0 ]?.toLowerCase() || 'en';
}

export function I18nProvider ( { children }: { children: ReactNode } )
{
    const browserLang = detectBrowserLanguage();
    const [ locale, setLocaleState ] = useState<string>( () =>
    {
        const saved = localStorage.getItem( 'fmb_locale' );
        if ( saved && LOCALES[ saved ] ) return saved;
        // Auto-detect: use browser language if available, else English
        return LOCALES[ browserLang ] ? browserLang : 'en';
    } );

    const setLocale = useCallback( ( newLocale: string ) =>
    {
        setLocaleState( newLocale );
        localStorage.setItem( 'fmb_locale', newLocale );
    }, [] );

    const t = useCallback( ( key: string, vars?: Record<string, string> ): string =>
    {
        const dict = LOCALES[ locale ] ?? LOCALES[ 'en' ]!;
        let value = dict[ key ] ?? LOCALES[ 'en' ]![ key ] ?? key;
        if ( vars )
        {
            for ( const [ k, v ] of Object.entries( vars ) )
            {
                value = value.replace( `{${ k }}`, v );
            }
        }
        return value;
    }, [ locale ] );

    const languageName = useCallback( ( code: string ): string =>
    {
        return LANGUAGE_NAMES[ code ] ?? code.toUpperCase();
    }, [] );

    const availableLocales = Object.keys( LOCALES );
    const isBrowserLanguageAvailable = !!LOCALES[ browserLang ];

    return (
        <I18nContext.Provider value={ {
            locale,
            setLocale,
            t,
            availableLocales,
            languageName,
            browserLanguage: browserLang,
            isBrowserLanguageAvailable,
        } }>
            { children }
        </I18nContext.Provider>
    );
}
