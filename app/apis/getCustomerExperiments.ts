import { getCustomerEntity } from "./getCustomerEntity";
import { type ApiRequestOptions } from "../apis/utils/networkRequest";

type Experiments = { [key: number]: { variant: number; version: number } };

export async function getCustomerExperiments(
  options: ApiRequestOptions,
  customerId: number
) {
  const experiments = await getCustomerEntity(
    options,
    customerId,
    "experiments"
  );

  return experiments.results.reduce(
    (acc: Experiments, experiment: { variant: number; experiment: number }) => {
      const experimentNumber = Number(
        String(experiment.experiment).substring(0, 3)
      );

      // Handle revvs
      if (
        acc[experimentNumber] &&
        acc[experimentNumber].version > experiment.experiment
      ) {
        return acc;
      }

      acc[experimentNumber] = {
        variant: experiment.variant,
        version: experiment.experiment,
      };

      return acc;
    },
    {} as Experiments
  );
}
