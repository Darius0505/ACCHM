import { Font } from '@react-pdf/renderer';

/**
 * Register Noto Sans font for Vietnamese Unicode support
 * Using local static TTF files (react-pdf doesn't support variable fonts)
 */
Font.register({
    family: 'Noto Sans',
    fonts: [
        {
            src: '/fonts/NotoSans-Regular.ttf',
            fontWeight: 400,
        },
        {
            src: '/fonts/NotoSans-Bold.ttf',
            fontWeight: 700,
        },
        {
            src: '/fonts/NotoSans-Italic.ttf',
            fontWeight: 400,
            fontStyle: 'italic',
        },
    ],
});

// Hyphenation callback - disable hyphenation for Vietnamese
Font.registerHyphenationCallback((word) => [word]);

export const FONT_FAMILY = 'Noto Sans';
