import { NextRequest, NextResponse } from 'next/server';
import { validateGiftCardCode } from '@/lib/giftcard';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ isValid: false, error: 'Gavekortkode mangler' }, { status: 400 });
    }

    const result = await validateGiftCardCode(code);
    if (!result.isValid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Gift card validate error:', error);
    return NextResponse.json(
      { isValid: false, error: 'Kunne ikke validere gavekort' },
      { status: 500 }
    );
  }
}
