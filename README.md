# Vulcan RWD IG
> Retreiver implementation of the RWD IG http://build.fhir.org/ig/HL7/vulcan-rwd/.


## Quick project overview

- `10_main.ipynb`
    - TODO
- `00_core.ipynb`
    - TODO

## chat with sergey

- need to think about real life posibility of using FHIR to build cohorts
    - need to be careful that we don't get sucked into spending all our time on feasibility
- we have patient ID and we know which hospital etc it came from - prove capability by pulling data for specified patients
    - FHIR middle layer (trinetex, ehr vendors etc) will enable cohort building etc
    - make sure we have all of the FHIR domains - to prove that FHIR is doing a good job as a transport service
        - for SDTM submission / typical FDA sponsor study
- secondary is what are we using this data for?
- ID management
    - IP address of EHR data provider - now go get the data
        - you can't find patient unless someone also gives you patient ID
        - if we have study ID, some kind of recruitment service could resolve study ID to patients
- use case for IPS is when someone is travelling abroad, IPS gives relevant clinical details to help treatment
    - how do we pull IPS by patient ID?
    - might be built around current - not full history that we need for research
    - how much do we need to extend IPS?
        - might we need an option to use non-IPS? possibly based on US core
        
## bring back

how can sd tech build a fhir server of our own ...

# Running locally

Note: See conda setup below

The easiest way to get started is to run the app from the command line.

```
SET X_API_KEYS=['test']
conda activate vulcan_rwd_ig
cd github\pete88b\vulcan_rwd_ig
uvicorn app:app --reload
```

Hit [the docs page](http://127.0.0.1:8000/docs) or [the index page](http://127.0.0.1:8000/static/index.html) and try it out

# Deployment

The app is currently available at; https://vulcan-rwd-ig.azurewebsites.net
- https://vulcan-rwd-ig.azurewebsites.net/docs
- https://vulcan-rwd-ig.azurewebsites.net/static/index.html

See https://fastapi.tiangolo.com/deployment/server-workers/ if you're interested in startup command options.

## Deploy with `az webapp up` (using powershell)

This kind of az deploy needs;
- `requirements.txt` lists required packages [see App Service docs](https://docs.microsoft.com/en-us/azure/app-service/configure-language-python)
- `app.py` to create the FastAPI app.

Note: If you change anything in requirements.txt, you'll probably have to delete the app service and recreate with `az webapp up`.

`.azure/config` provides config details for deploying via the az command line tool (we don't push this file to github).

### `az` command setup

I installed the azure cli via msi: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows?tabs=azure-cli

### Login
`az login`

### Set your default subscription

you might already have this as your default - see: `az account list`

`az account set --name ???`

### deply the app 
`az webapp up`

### Configure the startup command

In the azure portal;
- select the app service
- Configuration
- General settings
- Startup command
    - set to `gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0`

### turn on logging - this is a good idea after creating the app service
`az webapp log config --docker-container-logging filesystem`

### check logs
`az webapp log tail`

# Developers

## Conda set-up

`conda env create -f environment.yaml`
