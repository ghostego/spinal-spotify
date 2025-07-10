
	export const getRandomResults = (arr: Record<string, any>[], amount: number) => {
		const tempArr = [...arr]
		const randomArray = []
		let randomCount = 0;
		while (randomCount < amount) {
			let randomIndex = Math.floor(Math.random() * tempArr.length);
			const randomItem = tempArr[randomIndex];
			randomArray.push(randomItem);
			tempArr.splice(randomIndex, 1);
			randomCount++
		}
		return randomArray;
	}