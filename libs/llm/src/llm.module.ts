import { Module } from '@nestjs/common';

import { ConfigurableModuleClass } from './llm.module-definition';
import { LLMService } from './llm.service';

@Module({
  providers: [LLMService],
  exports: [LLMService],
})
export class LLMModule extends ConfigurableModuleClass {}
