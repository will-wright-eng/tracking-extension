FROM ruby:3.0.0

WORKDIR /
RUN curl https://pre-commit.com/install-local.py | python -
# COPY pre-commit/.pre-commit-config.yaml .

RUN pre-commit install-hooks
RUN pre-commit run --all-files
