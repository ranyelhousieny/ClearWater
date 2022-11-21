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
                italic: true,
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
