export const setStorageWithExpiration = (key: string, value: string, expiration: number) => {
	const storageObject: {
		value: string,
		expiration: number,
	} = {
		value,
		expiration
	}
	localStorage.setItem(key, JSON.stringify(storageObject));
}

export const setStorage = (key: string, value: string) => {
	const storageObject: {
		value: string,
	} = {
		value
	};
	localStorage.setItem(key, JSON.stringify(storageObject));
}

export const getStorage = (key: string) => {
	const storedObject = localStorage.getItem(key);
	if (!storedObject) return;
	return JSON.parse(storedObject);
}