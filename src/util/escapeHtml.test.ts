import escapeHtml from './escapeHtml';

describe('escapeHtml', () => {
	test.each([
		['<', '&lt;'],
		['>', '&gt;'],
		['"', '&quot;'],
		['<a>', '&lt;a&gt;'],
		['\tthis is <a>test</a>', '\tthis is &lt;a&gt;test&lt;/a&gt;'],
		['"test"', '&quot;test&quot;'],
		["\"\"''''", '&quot;&quot;&#x27;&#x27;&#x27;&#x27;'],
	])('should escape unsafe HTML characters (case %#)', (source, expected) => {
		expect(escapeHtml(source)).toBe(expected);
	});
});
