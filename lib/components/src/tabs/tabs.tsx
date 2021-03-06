import React, {
  Children,
  Component,
  Fragment,
  FunctionComponent,
  MouseEvent,
  ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import { styled } from '@storybook/theming';

import { Placeholder } from '../placeholder/placeholder';
import { FlexBar } from '../bar/bar';
import { TabButton } from '../bar/button';

interface WrapperProps {
  bordered?: boolean;
  absolute?: boolean;
}

const Wrapper = styled.div<WrapperProps>(
  ({ theme, bordered }) =>
    bordered
      ? {
          backgroundClip: 'padding-box',
          border: `1px solid ${theme.appBorderColor}`,
          borderRadius: theme.appBorderRadius,
          overflow: 'hidden',
        }
      : {},
  ({ absolute }) =>
    absolute
      ? {
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }
      : {
          display: 'block',
        }
);

export const TabBar = styled.div({
  overflow: 'hidden',

  '&:first-of-type': {
    marginLeft: 0,
  },
});

interface ContentProps {
  absolute?: boolean;
}

const Content = styled.div<ContentProps>(
  {
    display: 'block',
    position: 'relative',
  },
  ({ theme }) => ({
    fontSize: theme.typography.size.s2 - 1,
  }),
  ({ absolute }) =>
    absolute
      ? {
          height: 'calc(100% - 40px)',

          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: 40,
          overflow: 'auto',
          '& > *:first-child': {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            height: '100%',
            overflow: 'auto',
          },
        }
      : {}
);

interface VisuallyHiddenProps {
  active?: boolean;
}

const VisuallyHidden = styled.div<VisuallyHiddenProps>(({ active }) =>
  active ? { display: 'block' } : { display: 'none' }
);

interface TabWrapperProps {
  active: boolean;
  render?: () => JSX.Element;
  children?: ReactNode;
}

export const TabWrapper: FunctionComponent<TabWrapperProps> = ({ active, render, children }) => (
  <VisuallyHidden active={active}>{render ? render() : children}</VisuallyHidden>
);

export const panelProps = {
  active: PropTypes.bool,
};

const childrenToList = (children: any, selected: string) =>
  Children.toArray(children).map(({ props: { title, id, children: childrenOfChild } }, index) => {
    const content = Array.isArray(childrenOfChild) ? childrenOfChild[0] : childrenOfChild;
    return {
      active: selected ? id === selected : index === 0,
      title,
      id,
      render:
        typeof content === 'function'
          ? content
          : // eslint-disable-next-line react/prop-types
            ({ active, key }: any) => (
              <VisuallyHidden key={key} active={active} role="tabpanel">
                {content}
              </VisuallyHidden>
            ),
    };
  });

interface TabsProps {
  id?: string;
  children?: ReactNode;
  tools?: ReactNode;
  selected?: string;
  actions?: {
    onSelect: (id: string) => void;
  };
  absolute?: boolean;
  bordered?: boolean;
}

export const Tabs = React.memo<TabsProps>(
  ({ children, selected, actions, absolute, bordered, tools, id: htmlId }: TabsProps) => {
    const list = childrenToList(children, selected);

    return list.length ? (
      <Wrapper absolute={absolute} bordered={bordered} id={htmlId}>
        <FlexBar border>
          <TabBar role="tablist">
            {list.map(({ title, id, active }) => (
              <TabButton
                type="button"
                key={id}
                active={active}
                onClick={(e: MouseEvent) => {
                  e.preventDefault();
                  actions.onSelect(id);
                }}
                role="tab"
              >
                {typeof title === 'function' ? title() : title}
              </TabButton>
            ))}
          </TabBar>
          {tools ? <Fragment>{tools}</Fragment> : null}
        </FlexBar>
        <Content absolute={absolute}>
          {list.map(({ id, active, render }) => render({ key: id, active }))}
        </Content>
      </Wrapper>
    ) : (
      <Placeholder>
        <Fragment key="title">Nothing found</Fragment>
      </Placeholder>
    );
  }
);
Tabs.displayName = 'Tabs';
(Tabs as any).defaultProps = {
  id: null,
  children: null,
  tools: null,
  selected: null,
  absolute: false,
  bordered: false,
};

type FuncChilden = () => void;

interface TabsStateProps {
  children: Array<ReactNode | FuncChilden>;
  initial: string;
  absolute: boolean;
  bordered: boolean;
}

interface TabsStateState {
  selected: string;
}

export class TabsState extends Component<TabsStateProps, TabsStateState> {
  static defaultProps: TabsStateProps = {
    children: [],
    initial: null,
    absolute: false,
    bordered: false,
  };

  constructor(props: TabsStateProps) {
    super(props);

    this.state = {
      selected: props.initial,
    };
  }

  render() {
    const { bordered = false, absolute = false, children } = this.props;
    const { selected } = this.state;
    return (
      <Tabs
        bordered={bordered}
        absolute={absolute}
        selected={selected}
        actions={{
          onSelect: id => this.setState({ selected: id }),
        }}
      >
        {children}
      </Tabs>
    );
  }
}
