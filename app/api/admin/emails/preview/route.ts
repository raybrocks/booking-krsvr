import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { render } from '@react-email/components';
import { EMAIL_TEMPLATES, getEmailTemplate } from '@/components/emails/registry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('id');

    if (templateId) {
      const template = getEmailTemplate(templateId);
      if (!template) {
        return NextResponse.json({ error: 'Mal ikke funnet' }, { status: 404 });
      }

      const html = await render(React.createElement(template.Component, template.mockProps));

      return NextResponse.json({
        id: template.id,
        title: template.title,
        category: template.category,
        categoryLabel: template.categoryLabel,
        subject: template.subject,
        trigger: template.trigger,
        filePath: template.filePath,
        mockProps: template.mockProps,
        html,
      });
    }

    // Render all templates
    const renderedTemplates = await Promise.all(
      EMAIL_TEMPLATES.map(async (template) => {
        let html = '';
        try {
          html = await render(React.createElement(template.Component, template.mockProps));
        } catch (renderError: any) {
          console.error(`Failed to render email template ${template.id}:`, renderError);
          html = `<div style="color: red; padding: 20px;">Feil ved rendering av mal: ${renderError.message}</div>`;
        }

        return {
          id: template.id,
          title: template.title,
          category: template.category,
          categoryLabel: template.categoryLabel,
          subject: template.subject,
          trigger: template.trigger,
          filePath: template.filePath,
          mockProps: template.mockProps,
          html,
        };
      })
    );

    return NextResponse.json({
      templates: renderedTemplates,
    });
  } catch (error: any) {
    console.error('Email preview API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
