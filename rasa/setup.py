from setuptools import setup, find_packages

setup(
    name="ember_actions",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "rasa-sdk>=3.0.0",
        "requests>=2.0.0",
    ],
)