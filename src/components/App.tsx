/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';

import React from 'react';
import CommandPalette, { Command } from 'react-command-palette';
import markdownToTxt from 'markdown-to-txt';

// @ts-ignore
import theme from '../../node_modules/react-command-palette/dist/themes/sublime-theme';
import '../../node_modules/react-command-palette/dist/themes/sublime.css';


const scrollTo = async (blockUuid: string) => {
	const page = await logseq.Editor.getCurrentPage();
	if (!page) { return; }
	logseq.Editor.scrollToBlockInPage(
		page.name, blockUuid
	);
};


const selectionHandler = (item: Record<string, unknown>) => {
	if (item) scrollTo(item.id as string);
};


function App(props: {
	blocks: BlockEntity[]
}) {

	const items: Command[] = [];
	const recurse = (block: BlockEntity, depth: number) => {
		if (depth > 3) { // TODO: make this configurable
			return;
		}
		const cmd: Command = {
			// @ts-expect-error
			id: block.uuid,
			name: '—'.repeat(depth) + ' ' + markdownToTxt(block.content),
			command: () => scrollTo(block.uuid),
			color: 'transparent',
		};
		items.push(cmd);
		const children = block.children || [];
		if (children.length) {
			(children as BlockEntity[]).forEach(
				(block) => recurse(block, depth + 1)
			);
		}
	};
	props.blocks.forEach(
		(block) => recurse(block, 0)
	);

	return <CommandPalette
		open
		closeOnSelect
		alwaysRenderCommands
		highlightFirstSuggestion
		resetInputOnOpen
		placeholder="Type to filter..."
		hotKeys={[]}
		trigger={null}
		theme={theme}
		commands={items}
		maxDisplayed={500} // hard max. limit
		onHighlight={selectionHandler}
		onSelect={selectionHandler}
		onRequestClose={() => logseq.hideMainUI()}
	/>;
}

export default App;
