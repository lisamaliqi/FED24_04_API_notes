import { PrismaClient } from "@prisma/client";
import { log } from "console";
const prisma = new PrismaClient();

async function main() {
	console.log("It works?");

    // (GET)Hämta ut alla phones från databasen och logga ut det i konsollen med prisma 
	// SELECT * FROM phones
	const phones1 = await prisma.phones.findMany();
	console.log("Phones1:", phones1);


    // (GET)Hämta ut alla phones men endast manufacturer och model kollumnerna 
	// SELECT manufacturer, model FROM phones
	const phones2 = await prisma.phones.findMany({
		select: {
			manufacturer: true,
			model: true,
		},
	});
    console.log('phones2: ', phones2);
    

    // (GET) Hämta alla mobiler där manufacturer == 'Apple'
	// SELECT * FROM phones WHERE manufacturer = "Apple"
	const phones3 = await prisma.phones.findMany({
		where: {
			manufacturer: "Apple",
		},
	});
	console.log("Phones3:", phones3);


    // (GET) Hämta några användare och logga dem till konsollen
	// SELECT * FROM users
	const users = await prisma.users.findMany({ 
		// where: {
		// 	name: {
		// 		contains: "An",    // WHERE `name` LIKE "%An%"
		// 		// startsWith: "Th",  // WHERE `name` LIKE "Th%"
		// 		// endsWith: "an",       // WHERE `name` LIKE "%an"
		// 	},
		// },
		orderBy: [
			{
				name: "asc",          // ORDER BY `name` ASC, sortera från a-z
			},
			{
				title: "asc",         // ORDER BY `name`, `title`
			},
		],
		take: 2,                      // LIMIT 2, ta bara två stycken från listan 
		skip: 4,                      // OFFSET 4, skippa de fyra första
	});
	console.log("Users:", users);


    // (GET) Hämta första user som matchar vår query
    // Retunerar ett objekt eller null ifall inga rows matchar queryn
	const first_user = await prisma.users.findFirst({
		where: {
			name: {
				startsWith: "Th",
			},
		},
	});
	console.log("First user:", first_user);


    // (GET) user med ID = 7
	const leeloo = await prisma.users.findUnique({
		where: {
			id: 7,
		},
	});
	console.log("Leeloo:", leeloo);


    // (GET) hämta user med id = 4 eller "kasta"
    // Testa ett felaktigt id för att få err
	try {
		const haxx0r_user = await prisma.users.findUniqueOrThrow({
			where: {
				id: 4,
			},
		});
		console.log("haxx0r_user:", haxx0r_user.name);
	} catch (err) {
		console.log("Probably didnt find user");
	}


    // (GET) Hämta ut phone med id = 1 SAMT inkludera user (användaren)
	const nokia_8110 = await prisma.phones.findUnique({
		where: {
			id: 1,
		},
		include: {
			user: true,
		},
	});
	console.log("info about Nokia 8110 and its user:", nokia_8110);


    // (GET) hämta ut user och dess mobil (ifall det finns en mobil);
	const user_with_phone = await prisma.users.findUnique({
		where: {
			id: 5,
		},
		include: {
			phones: true,
		},
	});
	console.log("User with phone:", user_with_phone);


    // (GET) Hämta ALLA users och deras phones (om de har någon)
	const users_with_phones = await prisma.users.findMany({
		include: {
			phones: true,
		},
	});
	// console.log("Users with phones:", phones_with_user);
	console.log("Users with phones:");
	console.dir(users_with_phones, { depth: Infinity });  // Output all ze levels!
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});