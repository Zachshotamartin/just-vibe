# Healthcare software, PHI and clinical support boundaries

Use when: phi, hipaa, emr, ehr, cdss, clinical decision support.

Review healthcare software behavior using synthetic/deidentified fixtures and explicit data boundaries.

## Inspect first

- Data flow, tenant/role authorization and audit events
- Clinical intended use, terminology/version and provenance
- Retention, access, encryption and incident procedures

## Method

1. Map where health data enters, is stored, leaves and is logged; minimize fields and separate operational telemetry from identifiable clinical data.
2. Test role/object authorization, emergency access policy, session handling and audit completeness with synthetic patients.
3. For CDSS, preserve input provenance, missing-data behavior, override paths and clinician-facing uncertainty. Software tests do not establish clinical safety, efficacy or regulatory status.
4. Verify current authoritative requirements for the actual jurisdiction and deployment; do not label the system HIPAA compliant from a checklist or scanner.

## Failure cases

- A support log contains raw patient data.
- A clinician can access another tenant’s chart by changing an ID.
- A recommendation is presented without missing-input or version context.

## Verification

- Use synthetic cross-tenant and minimum-necessary data fixtures.
- Inspect audit events without exposing PHI.
- Record clinical validation and legal/compliance review as separate required evidence when applicable.

## Worked scenario

A lab-result alert must distinguish a missing unit or stale result from a clinically validated threshold crossing.

## Version-sensitive primary references

- [www.hhs.gov](https://www.hhs.gov/hipaa/for-professionals/security/index.html) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.fda.gov](https://www.fda.gov/medical-devices/software-medical-device-samd/clinical-decision-support-software) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
