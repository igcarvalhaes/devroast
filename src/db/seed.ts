import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { roasts } from "./schema/roasts";
import { submissions } from "./schema/submissions";

const CODE_SNIPPETS = [
	{
		language: "javascript" as const,
		code: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].qty;
  }
  if (total > 100) {
    total = total * 0.9;
    console.log("discount applied!");
  }
  return total;
}`,
	},
	{
		language: "javascript" as const,
		code: `eval(prompt("enter code"))
document.write(response)
// trust the user lol`,
	},
	{
		language: "typescript" as const,
		code: `if (x == true) { return true; }
else if (x == false) { return false; }
else { return !false; }`,
	},
	{
		language: "typescript" as const,
		code: `async function fetchData(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}`,
	},
	{
		language: "typescript" as const,
		code: `const getUser = (id: any) => {
  // @ts-ignore
  return db.query("SELECT * FROM users WHERE id = " + id);
}`,
	},
	{
		language: "python" as const,
		code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
	},
	{
		language: "python" as const,
		code: `import os
password = "admin123"
os.system("rm -rf /")
# TODO: fix later`,
	},
	{
		language: "python" as const,
		code: `class User:
    def __init__(self, name, age, email, phone, address):
        self.name = name
        self.age = age
        self.email = email
        self.phone = phone
        self.address = address
        self.is_active = True
        self.is_admin = False
        self.is_verified = False
        self.login_count = 0
        self.last_login = None`,
	},
	{
		language: "java" as const,
		code: `public static String reverseString(String str) {
    String reversed = "";
    for (int i = str.length() - 1; i >= 0; i--) {
        reversed = reversed + str.charAt(i);
    }
    return reversed;
}`,
	},
	{
		language: "java" as const,
		code: `public void processData(Object data) {
    if (data != null) {
        if (data instanceof String) {
            if (((String) data).length() > 0) {
                if (!((String) data).equals("null")) {
                    System.out.println(data);
                }
            }
        }
    }
}`,
	},
	{
		language: "go" as const,
		code: `func divide(a, b int) int {
	return a / b // what could go wrong?
}`,
	},
	{
		language: "go" as const,
		code: `func readFile(path string) string {
	data, _ := os.ReadFile(path)
	return string(data)
}`,
	},
	{
		language: "rust" as const,
		code: `fn main() {
    let mut v: Vec<i32> = Vec::new();
    for i in 0..1000000 {
        v.push(i);
    }
    let sum: i32 = v.iter().sum();
    println!("{}", sum);
}`,
	},
	{
		language: "sql" as const,
		code: `SELECT * FROM users WHERE 1=1
-- TODO: add authentication`,
	},
	{
		language: "sql" as const,
		code: `DELETE FROM orders WHERE customer_id IN (
  SELECT id FROM customers
  WHERE last_login < '2020-01-01'
)
-- no backup needed right?`,
	},
	{
		language: "html" as const,
		code: `<div>
  <div>
    <div>
      <div>
        <div>
          <span>hello world</span>
        </div>
      </div>
    </div>
  </div>
</div>`,
	},
	{
		language: "css" as const,
		code: `.container {
  width: 100%;
  max-width: 100%;
  min-width: 100%;
  margin: 0 auto;
  padding: 0;
  margin: 0;
  display: flex;
  display: block;
  display: inline-block;
}`,
	},
	{
		language: "javascript" as const,
		code: `const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function pollApi() {
  while (true) {
    const res = await fetch("/api/status");
    if (res.ok) break;
    await sleep(100); // this is fine
  }
}`,
	},
	{
		language: "typescript" as const,
		code: `type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;

// I am very smart`,
	},
	{
		language: "javascript" as const,
		code: `function isEven(n) {
  if (n === 0) return true;
  if (n === 1) return false;
  return isEven(n - 2);
}`,
	},
	{
		language: "csharp" as const,
		code: `public class Singleton {
  private static Singleton instance;
  public static Singleton Instance {
    get {
      if (instance == null) {
        instance = new Singleton();
      }
      return instance;
    }
  }
  // not thread safe but whatever
}`,
	},
	{
		language: "python" as const,
		code: `def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# takes 3 hours for n=50`,
	},
	{
		language: "javascript" as const,
		code: `try {
  doSomething();
} catch (e) {
  // ignore
}`,
	},
	{
		language: "typescript" as const,
		code: `const config: any = {};
const settings: any = {};
const options: any = {};
const params: any = {};
// types are overrated`,
	},
	{
		language: "go" as const,
		code: `func handler(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(r.Body)
	var data map[string]interface{}
	json.Unmarshal(body, &data)
	result, _ := db.Exec("INSERT INTO users VALUES ($1)", data["name"])
	w.Write([]byte(fmt.Sprintf("%v", result)))
}`,
	},
];

const ROAST_FEEDBACK_TEMPLATES = [
	"This code is like a car crash — you can't look away, but you know someone got hurt. {detail}",
	"I've seen spaghetti more organized than this. {detail}",
	"This code works the same way a broken clock is right twice a day. {detail}",
	"If code reviews had a hall of shame, this would be the headliner. {detail}",
	"The only thing consistent about this code is how consistently bad it is. {detail}",
	"This looks like it was written during a hackathon at 4am after 8 Red Bulls. {detail}",
	"I showed this to my rubber duck and it quit. {detail}",
	"This code has more red flags than a communist parade. {detail}",
	"Congratulations, you've managed to violate every SOLID principle in {lines} lines. {detail}",
	"This is what happens when you copy-paste from Stack Overflow without reading the answers. {detail}",
	"Even ChatGPT would refuse to generate this. {detail}",
	"Your future self will look at this and cry. Actually, your present self should be crying too. {detail}",
	"This code is technically functional, which is the nicest thing I can say about it. {detail}",
	"I've seen better error handling in a YOLO deploy script. {detail}",
	"The variable naming here is a crime against readability. {detail}",
];

const HONEST_FEEDBACK_TEMPLATES = [
	"The code is functional but has some areas for improvement. {detail}",
	"There are a few patterns here that could be refactored for better maintainability. {detail}",
	"Overall structure is okay, but there are some potential bugs lurking. {detail}",
	"This is a reasonable first draft. Here's what I'd change before merging. {detail}",
	"The logic is correct but the implementation could be more idiomatic. {detail}",
	"Not bad, but there are {count} things I'd fix before shipping this. {detail}",
	"This works, but it won't scale well. Here's why. {detail}",
	"Decent effort. The main issues are around error handling and edge cases. {detail}",
];

const FEEDBACK_DETAILS = [
	"No error handling whatsoever — one bad input and this thing explodes.",
	"Magic numbers everywhere. Would it kill you to use a constant?",
	"The nested ifs here go deeper than the Mariana Trench.",
	"Using var/let where const would suffice shows a lack of discipline.",
	"SQL injection vulnerability wide enough to drive a truck through.",
	"Mutating state all over the place makes this impossible to debug.",
	"No types, no safety net, no hope.",
	"This function does 47 different things. Ever heard of single responsibility?",
	"The O(n²) complexity here will bring your server to its knees.",
	"Swallowing exceptions silently is how production incidents are born.",
	"Using any as a type is not a TypeScript strategy, it's a surrender.",
	"Hardcoded credentials in the source code. Bold move.",
	"The recursive approach without memoization will stack overflow on any real input.",
	"Thread safety? Never heard of her.",
	"This div soup makes the DOM weep.",
];

function generateFeedback(mode: "honest" | "roast", code: string): string {
	const templates = mode === "roast" ? ROAST_FEEDBACK_TEMPLATES : HONEST_FEEDBACK_TEMPLATES;
	const template = faker.helpers.arrayElement(templates);
	const detail = faker.helpers.arrayElement(FEEDBACK_DETAILS);
	const lines = code.split("\n").length;
	const count = faker.number.int({ min: 2, max: 5 });

	return template
		.replace("{detail}", detail)
		.replace("{lines}", String(lines))
		.replace("{count}", String(count));
}

function generateSuggestedCode(original: string): string {
	return original
		.replace("var ", "const ")
		.replace("console.log", "logger.info")
		.replace("// TODO:", "// FIXME:")
		.replace("== ", "=== ")
		.replace("any", "unknown")
		.replace("eval(", "/* NEVER use eval */ eval(")
		.replace("rm -rf", "# DANGEROUS: rm -rf");
}

const SEED_COUNT = 100;

async function seed() {
	// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required for seed
	const client = postgres(process.env.DATABASE_URL!);
	const db = drizzle(client, { casing: "snake_case" });

	console.log("Seeding database with %d entries...", SEED_COUNT);

	const submissionValues = Array.from({ length: SEED_COUNT }, () => {
		const snippet = faker.helpers.arrayElement(CODE_SNIPPETS);
		const mode = faker.helpers.arrayElement(["honest", "roast"] as const);

		return {
			code: snippet.code,
			language: snippet.language,
			mode,
			createdAt: faker.date.recent({ days: 90 }),
		};
	});

	const insertedSubmissions = await db
		.insert(submissions)
		.values(submissionValues)
		.returning({ id: submissions.id });

	console.log("Inserted %d submissions", insertedSubmissions.length);

	const roastValues = insertedSubmissions.map((sub, i) => {
		const isCompleted = faker.number.float({ min: 0, max: 1 }) < 0.9;
		const isFailed = !isCompleted && faker.number.float({ min: 0, max: 1 }) < 0.3;
		const status = isCompleted
			? ("completed" as const)
			: isFailed
				? ("failed" as const)
				: ("pending" as const);

		const mode = submissionValues[i].mode;
		const code = submissionValues[i].code;
		const createdAt = submissionValues[i].createdAt;

		const score =
			status === "completed"
				? Math.round(faker.number.float({ min: 0.5, max: 9.8 }) * 10) / 10
				: null;

		const feedback = status === "completed" ? generateFeedback(mode, code) : null;
		const suggestedCode = status === "completed" ? generateSuggestedCode(code) : null;
		const completedAt =
			status === "completed"
				? new Date(createdAt.getTime() + faker.number.int({ min: 2000, max: 15000 }))
				: null;

		return {
			submissionId: sub.id,
			status,
			score,
			feedback,
			suggestedCode,
			createdAt,
			completedAt,
		};
	});

	const insertedRoasts = await db.insert(roasts).values(roastValues).returning({ id: roasts.id });

	console.log("Inserted %d roasts", insertedRoasts.length);

	const completed = roastValues.filter((r) => r.status === "completed").length;
	const pending = roastValues.filter((r) => r.status === "pending").length;
	const failed = roastValues.filter((r) => r.status === "failed").length;
	const avgScore =
		roastValues.filter((r) => r.score !== null).reduce((sum, r) => sum + (r.score ?? 0), 0) /
		(completed || 1);

	console.log("\nSeed summary:");
	console.log("  completed: %d", completed);
	console.log("  pending:   %d", pending);
	console.log("  failed:    %d", failed);
	console.log("  avg score: %s", avgScore.toFixed(1));

	await client.end();
	console.log("\nDone!");
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
