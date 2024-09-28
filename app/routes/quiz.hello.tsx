import { json } from "@remix-run/node";
import { MetaFunction, redirect, useLoaderData } from "@remix-run/react";
import { getCustomer } from "~/apis/getCustomer";
import { getCustomerEntity } from "~/apis/getCustomerEntity";
import { getCustomerSelf } from "~/apis/getCustomerSelf";
import { getTagGroup } from "~/apis/getTagGroup";
import { isWebView } from "~/utils/isWebView";
import { getCustomerExperiments } from "~/apis/getCustomerExperiments";
import { useState } from "react";
import { Me } from "~/components/svgs/Me";
import { MePlusOne } from "~/components/svgs/MePlusOne";
import { MePlusMore } from "~/components/svgs/MePlusMore";
import { Minus } from "~/components/svgs/Minus";
import { Plus } from "~/components/svgs/Plus";

export const meta: MetaFunction = () => {
  return [
    { title: "Select Plan | Hungryroot" },
    {
      property: "og:title",
      content: "Select Plan | Hungryroot",
    },
    {
      name: "description",
      content:
        "Hungryroot delivers healthy groceries with simple recipes. Build your plan today.",
    },
  ];
};

export async function loader({ request }: { request: Request }) {
  // Remix will support middlewares in the future
  const cookie = request.headers.get("cookie");
  if (!cookie) {
    return redirect("/remix/login");
  }

  const headers = {
    cookie,
  };

  // Blocking API Request
  const customer = await getCustomerSelf({ headers });

  // Run remaining API requests in parallel
  const remainingProps = await awaitAll({
    customerExperiments: getCustomerExperiments({ headers }, customer.id),
    customerDeprecated: getCustomer({ headers, cache: true }),

    tagGroup11: getTagGroup({ headers }, 11),
    tagGroup1: getTagGroup({ headers }, 1),
    tagGroup35: getTagGroup({ headers }, 35),
    tagGroup8: getTagGroup({ headers }, 8),
    tagGroup3: getTagGroup({ headers }, 3),
    tagGroup15: getTagGroup({ headers }, 15),
    tagGroup38: getTagGroup({ headers }, 38),
    tagGroup7: getTagGroup({ headers }, 7),
    tagGroup2: getTagGroup({ headers }, 2),
    tagGroup27: getTagGroup({ headers }, 27),
    tagGroup23: getTagGroup({ headers }, 23),
    tagGroup9: getTagGroup({ headers }, 9),

    dietaryRestrictions: getCustomerEntity(
      { headers },
      customer.id,
      "dietary_restrictions"
    ),
    dishTypes: getCustomerEntity({ headers }, customer.id, "dish_types"),
    quiz: getCustomerEntity({ headers }, customer.id, "quizzes"),
    tags: getCustomerEntity({ headers }, customer.id, "tags"),
    occasionGoals: getCustomerEntity(
      { headers },
      customer.id,
      "occasion_goals"
    ),
  });

  return json({
    customer,

    // Is the mobile app rendering this page?
    isWebView: isWebView(request.headers.get("user-agent")),

    ...remainingProps,
  });
}

export default function QuizHello() {
  const data = useLoaderData<typeof loader>();

  // @ts-expect-error -- no ts types for loader yet
  const isBoxBuilderVariant = (data.customerExperiments[146]?.variant ?? 0) > 0;

  return (
    <div className="w-full h-dvh flex flex-col gap-4">
      <div>
        <QuizHeader />
        <QuizProgressBar />
      </div>

      <div className="p-4 flex flex-col items-center flex-1">
        {isBoxBuilderVariant ? <BoxBuilderQuizHello /> : <QuizHouseholdSize />}
      </div>
      <QuizFooter />
    </div>
  );
}

function BoxBuilderQuizHello() {
  // Excluded from scope
  return <div>Box Builder Quiz</div>;
}

function QuizHouseholdSize() {
  // @ts-expect-error -- no ts types for loader yet
  const { quiz } = useLoaderData<typeof loader>();
  const [householdSize, setHouseholdSize] = useState(quiz?.household_size ?? 1);
  const [numAdults, setNumAdults] = useState(quiz?.num_adults ?? 1);
  const [numOlderChildren, setNumOlderChildren] = useState(
    quiz?.num_older_children ?? 0
  );
  const [numYoungerChildren, setNumYoungerChildren] = useState(
    quiz?.num_young_children ?? 0
  );

  return (
    <section className="flex flex-wrap flex-col gap-8 flex-1">
      <h1
        className="text-3xl text-center font-semibold"
        data-testid="who-are-you-feeding"
      >
        Who are you feeding?
      </h1>
      <div className="flex gap-4 flex-wrap self-center">
        <Box
          className="animation-delay-point-5s slide-in"
          onClick={() => setHouseholdSize(1)}
          active={householdSize === 1}
        >
          <Me />
          <div>Me</div>
        </Box>
        <Box
          className="animation-delay-point-55s slide-in"
          onClick={() => setHouseholdSize(2)}
          active={householdSize === 2}
        >
          <MePlusOne />
          <div>Me + 1</div>
        </Box>
        <Box
          className="animation-delay-point-6s slide-in"
          onClick={() => setHouseholdSize(3)}
          active={householdSize === 3}
        >
          <MePlusMore />
          <div>Me + more</div>
        </Box>
      </div>

      {householdSize > 1 ? (
        <div className="flex flex-col gap-8 mt-12">
          <div className="text-xl font-medium slide-in">
            Select how many people are in your household.
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-between gap-6">
              <ControlRange
                label="Adults"
                value={numAdults}
                setValue={setNumAdults}
              />
              <ControlRange
                label="Children, ages 9 and over"
                value={numOlderChildren}
                setValue={setNumOlderChildren}
              />
              <ControlRange
                label="Children, ages 8 and under"
                value={numYoungerChildren}
                setValue={setNumYoungerChildren}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Box({
  children,
  className,
  onClick,
  active,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`border p-4 rounded-lg w-[155px] h-[120px] flex flex-col gap-2 items-center hover:border-black border-grey-200 ${
        active ? "bg-stone-100 border-black border-2" : ""
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function ControlRange({
  label,
  value,
  setValue,
  className,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-4 justify-between items-center ${className ?? ""}`}
    >
      <div className="text-sm font-light">{label}</div>

      <div className="flex gap-4 items-center">
        <button
          aria-label={`Decrement ${label}`}
          disabled={value === 0}
          className="border p-1 rounded-full disabled:opacity-50"
          onClick={() => {
            setValue(value - 1);
          }}
        >
          <Minus />
        </button>
        <div className="text-xs w-[13px] text-center">{value}</div>
        <button
          aria-label={`Increment ${label}`}
          disabled={value === 10}
          className="border p-1 rounded-full disabled:opacity-50"
          onClick={() => {
            setValue(value + 1);
          }}
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}

function QuizHeader() {
  return (
    <header className="sticky flex justify-between gap-8 px-2 items-end px-4 pt-3 mb-2">
      <img
        src="https://dijfu5ooae7kt.cloudfront.net/public/img/logos/hr-logo-smile-red.svg"
        className="h-[40px] w-[85px]"
        alt="Hungryroot"
      />
      <button className="py-2 rounded-full button hover:bg-slate-300 px-6 h-[40px]">
        <h6 className="text-sm">Save and exit</h6>
      </button>
    </header>
  );
}

function QuizProgressBar() {
  return (
    <div
      className="w-full flex text-xs h-[21px] items-center"
      style={{
        color: "#794039",
        backgroundColor: "#fbf1ee",
      }}
    >
      <div className="w-1/3 relative">
        <div className="text-center uppercase tracking-widest">About you</div>
        <div
          className="w-1/12 absolute h-full top-0"
          style={{ backgroundColor: "#edab93" }}
        />
      </div>
      <div className="w-1/3 border-l-2 border-l-rose-200">
        <div className="text-center uppercase tracking-widest">Your tastes</div>
      </div>
      <div className="w-1/3 border-l-2 border-l-rose-200">
        <div className="text-center uppercase tracking-widest">
          Your daily routine
        </div>
      </div>
    </div>
  );
}

function QuizFooter() {
  return (
    <footer className="flex justify-end gap-8 px-2 border-t-2 items-center h-[75px]">
      <button
        className="button border rounded-full py-3 px-4 text-white text-sm"
        style={{ backgroundColor: "#4b69c4" }}
      >
        Next
      </button>
    </footer>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function awaitAll(object: Record<string, Promise<any>>) {
  const values = await Promise.all(Object.values(object));
  return Object.fromEntries(
    Object.keys(object).map((prop, i) => [prop, values[i]])
  );
}
