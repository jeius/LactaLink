import { Block } from 'payload';
import { CheckboxQuestionBlock } from './CheckboxQuestionBlock';
import { RadioQuestionBlock } from './RadioQuestionBlock';
import { TextQuestionBlock } from './TextQuestionBlock';

const QuestionBlocks: Block[] = [TextQuestionBlock, RadioQuestionBlock, CheckboxQuestionBlock];

export default QuestionBlocks;
