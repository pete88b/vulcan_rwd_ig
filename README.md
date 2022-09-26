# Vulcan RWD IG
> Retreiver implementation of the RWD IG http://build.fhir.org/ig/HL7/vulcan-rwd/.


## Quick project overview

- `_rwd_ig_cohort_building.ipynb`
    - Show how we can build a cohort by running FHIR queries with minimal client side processing
- `00_core.ipynb`
    - TODO

# Running locally

Note: See conda setup below

The easiest way to get started is to run the app from the command line.

```
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
