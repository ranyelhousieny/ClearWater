import React, {
  useCallback,
  useState,
} from 'react';
import {
  Slate,
  ReactEditor,
  withReact,
  Editable,
} from 'slate-react';
import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Element,
  Element as SlateElement,
  Text,
  Transforms,
} from 'slate';
import { HistoryEditor } from 'slate-history';

type CustomElement = {
  type: 'paragraph';
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: true;
  italic?: true;
  strikethrough?: true;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor &
      ReactEditor &
      HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialDocument: Descendant[] =
  [
    {
      type: 'paragraph',
      children: [
        {
          text: 'This is the text from the initial document . ',
        },
        {
          text: ' bold',
          bold: true,
        },
      ],
    },
  ];

const BasicEditor = () => {
  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf =
    useCallback(
      (props: any) => {
        return (
          <Leaf {...props} />
        );
      },
      []
    );
  const [editor] = useState(
    () =>
      withReact(
        createEditor()
      )
  );
  return (
    <div>
      <Slate
        editor={editor}
        value={
          initialDocument
        }>
        BasicEditor
        <Editable
          renderLeaf={
            renderLeaf
          }
          onKeyDown={(
            event
          ) => {
            if (
              !event.ctrlKey ||
              event.key !==
                'b'
            )
              return;
            event.preventDefault();

            Transforms.setNodes(
              editor,
              {
                strikethrough:
                  true,
              },
              {
                match: (n) =>
                  Text.isText(
                    n
                  ),
                split: true,
              }
            );
          }}
        />
      </Slate>
    </div>
  );
};
const isMarkActive = (
  editor: any,
  format: any
) => {
  const marks =
    Editor.marks(editor);
  return marks
    ? marks[format] === true
    : false;
};
const toggleMark = (
  editor: any,
  format: string
) => {
  const isActive =
    isMarkActive(
      editor,
      format
    );

  if (isActive) {
    Editor.removeMark(
      editor,
      format
    );
  } else {
    Editor.addMark(
      editor,
      format,
      true
    );
  }
};

const Leaf = ({
  attributes,
  children,
  leaf,
}: any) => {
  if (leaf.bold) {
    children = (
      <strong>
        {children}
      </strong>
    );
  }

  if (leaf.code) {
    children = (
      <code>{children}</code>
    );
  }

  if (leaf.italic) {
    children = (
      <em>{children}</em>
    );
  }
  if (leaf.strikethrough) {
    children = (
      <s>{children}</s>
    );
  }

  if (leaf.underline) {
    children = (
      <u>{children}</u>
    );
  }

  return (
    <span {...attributes}>
      {children}
    </span>
  );
};

export default BasicEditor;
