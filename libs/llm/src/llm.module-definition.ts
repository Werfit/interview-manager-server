import { ConfigurableModuleBuilder } from '@nestjs/common';

import { LLMOptions } from './llm.types';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<LLMOptions>()
    .setClassMethodName('forRoot')
    .build();
