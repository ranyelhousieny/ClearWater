import {
  render,
  screen,
} from '@testing-library/react';
import AdvancedEditor from './AdvancedEditor';

test('Try the editor', () => {
  render(<AdvancedEditor />);

  screen.getByText(
    'Enter some rich text…',
    { exact: false }
  );
});
