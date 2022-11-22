import React, {
  useCallback,
  useMemo,
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
  Element as SlateElement,
  Text,
  Transforms,
} from 'slate';
import { HistoryEditor } from 'slate-history';
import isHotkey from 'is-hotkey';

const HOTKEYS = {
  'ctrl+b': 'bold',
  'ctrl+i': 'italic',
  'ctrl+u': 'underline',
  'ctrl+s': 'strikethrough',
  'ctrl+`': 'code',
};

const BLOCKYES = {
  'ctrl+c': 'center',
  'ctrl+l': 'left',
  'ctrl+r': 'right',
};

const LIST_TYPES = [
  'numbered-list',
  'bulleted-list',
];
const TEXT_ALIGN_TYPES = [
  'left',
  'center',
  'right',
  'justify',
];

type CustomElement = {
  type: 'paragraph';
  children: CustomText[];
  align?: string;
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

const BasicEditor = () => {
  const renderElement =
    useCallback(
      (props) => (
        <Element {...props} />
      ),
      []
    );
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
  const initialDocument: Descendant[] =
    useMemo(
      () =>
        JSON.parse(
          localStorage.getItem(
            'content'
          )
        ) || [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Enter some rich text…',
              },
            ],
          },
        ],
      []
    );

  return (
    <div>
      <Slate
        editor={editor}
        value={
          initialDocument
        }
        onChange={(value) => {
          const isAstChange =
            editor.operations.some(
              (op) =>
                'set_selection' !==
                op.type
            );
          if (isAstChange) {
            // Save the value to Local Storage.
            const content =
              JSON.stringify(
                value
              );
            localStorage.setItem(
              'content',
              content
            );
          }
        }}>
        <Editable
          renderElement={
            renderElement
          }
          renderLeaf={
            renderLeaf
          }
          onKeyDown={(
            event
          ) => {
            for (const hotkey in HOTKEYS) {
              if (
                isHotkey(
                  hotkey,
                  event as any
                )
              ) {
                event.preventDefault();
                const mark =
                  HOTKEYS[
                    hotkey
                  ];
                toggleMark(
                  editor,
                  mark
                );
              }
            }
            for (const blockey in BLOCKYES) {
              if (
                isHotkey(
                  blockey,
                  event as any
                )
              ) {
                event.preventDefault();
                const mark =
                  BLOCKYES[
                    blockey
                  ];
                toggleBlock(
                  editor,
                  mark
                );
              }
            }
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
const isBlockActive = (
  editor,
  format,
  blockType = 'type'
) => {
  const { selection } =
    editor;
  if (!selection)
    return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(
        editor,
        selection
      ),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(
          n
        ) &&
        n[blockType] ===
          format,
    })
  );

  return !!match;
};

const toggleBlock = (
  editor: any,
  format: any
) => {
  const isActive =
    isBlockActive(
      editor,
      format,
      TEXT_ALIGN_TYPES.includes(
        format
      )
        ? 'align'
        : 'type'
    );
  const isList =
    LIST_TYPES.includes(
      format
    );

  Transforms.unwrapNodes(
    editor,
    {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(
          n
        ) &&
        LIST_TYPES.includes(
          n.type
        ) &&
        !TEXT_ALIGN_TYPES.includes(
          format
        ),
      split: true,
    }
  );
  let newProperties: Partial<SlateElement>;
  if (
    TEXT_ALIGN_TYPES.includes(
      format
    )
  ) {
    newProperties = {
      align: isActive
        ? undefined
        : format,
    };
  } else {
    newProperties = {
      type: isActive
        ? 'paragraph'
        : isList
        ? 'list-item'
        : format,
    };
  }
  Transforms.setNodes<SlateElement>(
    editor,
    newProperties
  );

  if (!isActive && isList) {
    const block = {
      type: format,
      children: [],
    };
    Transforms.wrapNodes(
      editor,
      block
    );
  }
};

const Element = ({
  attributes,
  children,
  element,
}) => {
  const style = {
    textAlign: element.align,
  };
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote
          style={style}
          {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul
          style={style}
          {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1
          style={style}
          {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2
          style={style}
          {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li
          style={style}
          {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol
          style={style}
          {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p
          style={style}
          {...attributes}>
          {children}
        </p>
      );
  }
};

export default BasicEditor;
