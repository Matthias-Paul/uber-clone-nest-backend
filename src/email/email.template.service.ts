import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailTemplateService {
  private readonly templateDirs: string[] = [
    join(process.cwd(), 'dist', 'email', 'templates'),
    join(process.cwd(), 'src', 'email', 'templates'),
  ];

  public render(
    templateName: string,
    context: Record<string, string | number> = {},
  ): string {
    const template = this.readTemplate(
      this.normalizeTemplateName(templateName),
    );

    return template.replace(
      /<%=\s*([A-Za-z0-9_]+)\s*%>/g,
      (_match: string, key: string) => {
        const value = context[key];
        return value === undefined ? '' : String(value);
      },
    );
  }

  private normalizeTemplateName(templateName: string): string {
    const cleanedName = templateName.replace(/^\.\//, '');
    return cleanedName.endsWith('.ejs') ? cleanedName : `${cleanedName}.ejs`;
  }

  private readTemplate(fileName: string): string {
    for (const dir of this.templateDirs) {
      const fullPath = join(dir, fileName);
      if (existsSync(fullPath)) {
        return readFileSync(fullPath, 'utf-8');
      }
    }

    throw new Error(`Email template not found: ${fileName}`);
  }
}
