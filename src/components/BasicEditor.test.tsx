import {
  render,
  screen,
} from '@testing-library/react';
import BasicEditor from './BasicEditor';

test('Try the editor', () => {
  render(<BasicEditor />);

  screen.getByText(
    'Enter some rich text…',
    { exact: false }
  );
});
