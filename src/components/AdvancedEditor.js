// Import React dependencies.
import React, {
  useCallback,
  useState,
} from 'react';
// Import the Slate editor factory.
import {
  createEditor,
  Editor,
  Text,
  Transforms,
  Descendant,
  Element as SlateElement,
} from 'slate';

// Import the Slate components and React plugin.
import {
  Slate,
  Editable,
  withReact,
  useSlate,
} from 'slate-react';
import isHotkey from 'is-hotkey';
import useSelection from '../hooks/useSelection';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
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

// Define our own custom set of helpers.
const CustomEditor = {
  isBlockActive(
    editor,
    format,
    blockType = 'type'
  ) {
    const { selection } =
      editor;
    if (!selection)
      return false;

    const [match] =
      Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(
            editor,
            selection
          ),
          match: (n) =>
            !Editor.isEditor(
              n
            ) &&
            SlateElement.isElement(
              n
            ) &&
            n[blockType] ===
              format,
        })
      );

    return !!match;
  },

  toggleBlock(
    editor,
    format
  ) {
    const isActive =
      CustomEditor.isBlockActive(
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
          !Editor.isEditor(
            n
          ) &&
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
    let newProperties;
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

    Transforms.setNodes(
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
  },

  isBoldMarkActive(editor) {
    const [match] =
      Editor.nodes(editor, {
        match: (n) =>
          n.bold === true,
        universal: true,
      });

    return !!match;
  },
  isstrikethroughMarkActive(
    editor
  ) {
    const [match] =
      Editor.nodes(editor, {
        match: (n) =>
          n.strikethrough ===
          true,
        universal: true,
      });

    return !!match;
  },
  isItalicMarkActive(editor) {
    const [match] =
      Editor.nodes(editor, {
        match: (n) =>
          n.italic === true,
        universal: true,
      });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] =
      Editor.nodes(editor, {
        match: (n) =>
          n.type === 'code',
      });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive =
      CustomEditor.isBoldMarkActive(
        editor
      );
    Transforms.setNodes(
      editor,
      {
        bold: isActive
          ? null
          : true,
      },
      {
        match: (n) =>
          Text.isText(n),
        split: true,
      }
    );
  },
  togglestrikethroughMark(
    editor
  ) {
    const isActive =
      CustomEditor.isstrikethroughMarkActive(
        editor
      );
    Transforms.setNodes(
      editor,
      {
        strikethrough:
          isActive
            ? null
            : true,
      },
      {
        match: (n) =>
          Text.isText(n),
        split: true,
      }
    );
  },
  toggleItalicMark(editor) {
    const isActive =
      CustomEditor.isItalicMarkActive(
        editor
      );
    Transforms.setNodes(
      editor,
      {
        italic: isActive
          ? null
          : true,
      },
      {
        match: (n) =>
          Text.isText(n),
        split: true,
      }
    );
  },

  toggleCodeBlock(editor) {
    const isActive =
      CustomEditor.isCodeBlockActive(
        editor
      );
    Transforms.setNodes(
      editor,
      {
        type: isActive
          ? null
          : 'code',
      },
      {
        match: (n) =>
          Editor.isBlock(
            editor,
            n
          ),
      }
    );
  },
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Enter some rich text…',
      },
    ],
  },
];

const AdvancedEditor = () => {
  const [
    document,
    updateDocument,
  ] = useState(initialValue);
  const onChange =
    updateDocument;
  const [editor] = useState(
    () =>
      withReact(
        createEditor()
      )
  );

  const renderElement =
    useCallback((props) => {
      switch (
        props.element.type
      ) {
        case 'code':
          return (
            <CodeElement
              {...props}
            />
          );
        default:
          return (
            <DefaultElement
              {...props}
            />
          );
      }
    }, []);

  const renderLeaf =
    useCallback((props) => {
      return (
        <Leaf {...props} />
      );
    }, []);

  const [
    selection,
    setSelection,
  ] = useSelection(editor);

  const onChangeHandler =
    useCallback(
      (document) => {
        onChange(document);
        setSelection(
          editor.selection
        );
      },
      [
        editor.selection,
        onChange,
        setSelection,
      ]
    );
  const toggleMark = (
    editor,
    format
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
  const isMarkActive = (
    editor,
    format
  ) => {
    const marks =
      Editor.marks(editor);
    return marks
      ? marks[format] === true
      : false;
  };

  return (
    <>
      <Slate
        editor={editor}
        value={initialValue}
        onChange={
          onChangeHandler
        }>
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
            // Replace the `onKeyDown` logic with our new commands.
            if (
              event.ctrlKey
            ) {
              switch (
                event.key
              ) {
                case 'c': {
                  event.preventDefault();
                  CustomEditor.toggleBlock(
                    editor,
                    'center'
                  );
                  break;
                }
                case 'l': {
                  event.preventDefault();
                  CustomEditor.toggleBlock(
                    editor,
                    'left'
                  );
                  break;
                }
                case 'R': {
                  event.preventDefault();
                  CustomEditor.toggleBlock(
                    editor,
                    'right'
                  );
                  break;
                }

                case 'i': {
                  event.preventDefault();
                  CustomEditor.toggleItalicMark(
                    editor
                  );
                  break;
                }
                case 's': {
                  event.preventDefault();
                  CustomEditor.togglestrikethroughMark(
                    editor
                  );
                  break;
                }

                case 'b': {
                  event.preventDefault();
                  CustomEditor.toggleBoldMark(
                    editor
                  );
                  break;
                }
              }
            }
          }}
        />
      </Slate>
    </>
  );
};

const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf
          .bold
          ? 'bold'
          : 'normal',
      }}>
      {props.children}
    </span>
  );
};

const CodeElement = (
  props
) => {
  return (
    <pre
      {...props.attributes}>
      <code>
        {props.children}
      </code>
    </pre>
  );
};

const DefaultElement = (
  props
) => {
  return (
    <p {...props.attributes}>
      {props.children}
    </p>
  );
};

export default AdvancedEditor;
