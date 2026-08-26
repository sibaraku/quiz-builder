import { Question, QuestionType } from '../types/quiz';

type QuestionEditorProps = {
  question: Question;
  index: number;
  canRemove: boolean;
  onChange: (changes: Partial<Question>) => void;
  onRemove: () => void;
};

export function QuestionEditor({
  question,
  index,
  canRemove,
  onChange,
  onRemove,
}: QuestionEditorProps) {
  function changeType(type: QuestionType) {
    onChange({
      type,
      answer: type === 'boolean' ? 'true' : '',
      options: type === 'checkbox' ? ['', ''] : [],
      correctOptions: [],
    });
  }

  function changeOption(optionIndex: number, value: string) {
    const oldOption = question.options[optionIndex];
    onChange({
      options: question.options.map((option, currentIndex) =>
        currentIndex === optionIndex ? value : option,
      ),
      // Keep a selected answer attached when its option text changes.
      correctOptions: question.correctOptions.map((option) =>
        option === oldOption ? value : option,
      ),
    });
  }

  function toggleCorrectOption(option: string, checked: boolean) {
    onChange({
      correctOptions: checked
        ? [...question.correctOptions, option]
        : question.correctOptions.filter((item) => item !== option),
    });
  }

  return (
    <section className="question-editor">
      <div className="question-heading">
        <strong>Question {index + 1}</strong>
        {canRemove && (
          <button type="button" className="link-button" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <label>
        Question text
        <input
          value={question.text}
          onChange={(event) => onChange({ text: event.target.value })}
          required
        />
      </label>
      <label>
        Type
        <select
          value={question.type}
          onChange={(event) => changeType(event.target.value as QuestionType)}
        >
          <option value="boolean">True / False</option>
          <option value="input">Short text</option>
          <option value="checkbox">Multiple choice</option>
        </select>
      </label>
      {question.type === 'boolean' && (
        <fieldset>
          <legend>Correct answer</legend>
          <label className="inline">
            <input
              type="radio"
              checked={question.answer === 'true'}
              onChange={() => onChange({ answer: 'true' })}
            />{' '}
            True
          </label>
          <label className="inline">
            <input
              type="radio"
              checked={question.answer === 'false'}
              onChange={() => onChange({ answer: 'false' })}
            />{' '}
            False
          </label>
        </fieldset>
      )}
      {question.type === 'input' && (
        <label>
          Expected answer
          <input
            value={question.answer}
            onChange={(event) => onChange({ answer: event.target.value })}
            required
          />
        </label>
      )}
      {question.type === 'checkbox' && (
        <fieldset>
          <legend>Options (select all correct)</legend>
          {question.options.map((option, optionIndex) => (
            <div className="option-row" key={optionIndex}>
              <input
                placeholder={`Option ${optionIndex + 1}`}
                value={option}
                onChange={(event) => changeOption(optionIndex, event.target.value)}
              />
              <label className="inline">
                <input
                  type="checkbox"
                  checked={question.correctOptions.includes(option) && option !== ''}
                  onChange={(event) => toggleCorrectOption(option, event.target.checked)}
                />{' '}
                Correct
              </label>
            </div>
          ))}
          <button
            type="button"
            className="link-button"
            onClick={() => onChange({ options: [...question.options, ''] })}
          >
            + Add option
          </button>
        </fieldset>
      )}
    </section>
  );
}