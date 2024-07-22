export function getURLwithSearchParams(
	url: string,
	searchParams: URLSearchParams
) {
	let str = url;

	if (searchParams.size > 0) {
		str += `?${searchParams.toString()}`;
	}

	return new URL(str).toString();
}

export function getCoercedSearchParams(
	values?: Record<string, string | number>
) {
	const searchParams = new URLSearchParams();

	if (values == null) {
		return searchParams;
	}

	[...Object.entries(values)].forEach(([key, value]) => {
		searchParams.append(key, value.toString());
	});

	return searchParams;
}
