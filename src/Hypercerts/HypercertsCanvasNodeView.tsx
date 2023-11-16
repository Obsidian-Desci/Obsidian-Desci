import React from "react"
import { useForm, Resolver, FieldErrors } from "react-hook-form"
import { useCreateHypercert} from './useHypercerts'
type FormValues = {
  hypercertName: string
  logoImageLink: string
  backgroundBannerImageLink: string
  description: string
  link: string
  workScope: string
  startDate: Date
  endDate: Date
  contributors: string[]
  allowList: FileList
  distributionToAllowList: number
  deduplicate: boolean
  contributorPermission: boolean
  hypercertToC: boolean
}

  const resolver: Resolver<FormValues> = async (values) => {
    const errors: FieldErrors<FormValues> = {};
    const requiredFields = [
      'hypercertName',
      'logoImageLink',
      'backgroundBannerImageLink',
      'description',
      'link',
      'workScope',
      'startDate',
      'endDate',
      'contributors',
      'allowList',
      'distributionToAllowList',
      'deduplicate',
      'contributorPermission',
      'hypercertToC',
    ];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = {
          type: 'required',
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        };
      }
    });

  return {
    values: Object.keys(errors).length > 0 ? {} : values,
    errors: errors,
  }
}

export const HyperCertsCanvasNodeView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver })
  const {
    createHypercert,
    result: createHypercertResult,
    hash: createHypercertHash,
  } = useCreateHypercert()
  const onSubmit = handleSubmit(async (data) => {
    console.log(data)
    await createHypercert(data)
  })


  return (<div style={{display:'flex', width: '100%', height: '100%', overflowY: 'scroll'}}>
    <form onSubmit={onSubmit}>
      <h4>Create Hypercert</h4>
      <p>Hypercert Name:</p>
      <input {...register("hypercertName")} placeholder="Hypercert Name" />
      {errors?.hypercertName && <p>{errors.hypercertName.message}</p>}
      <p>Hypercert Details</p>
      <input {...register("logoImageLink")} placeholder="Logo Image Link" />
      {errors?.logoImageLink && <p>{errors.logoImageLink.message}</p>}
      <p>Banner Image Link</p>
      <input {...register("backgroundBannerImageLink")} placeholder="Background Banner Image Link" />
      {errors?.backgroundBannerImageLink && <p>{errors.backgroundBannerImageLink.message}</p>}
      <p>Description</p>
      <input {...register("description")} placeholder="Description" />
      {errors?.description && <p>{errors.description.message}</p>}

      <p>Hypercert Link</p>
      <input {...register("link")} placeholder="Link" />
      {errors?.link && <p>{errors.link.message}</p>}
      <p>Work Scope</p>
      <input {...register("workScope")} placeholder="Work Scope" />
      {errors?.workScope && <p>{errors.workScope.message}</p>}
      <p>Start Date</p>
      <input {...register("startDate")} placeholder="Start Date" />
      {errors?.startDate && <p>{errors.startDate.message}</p>}
      <p>End Date</p>
      <input {...register("endDate")} placeholder="End Date" />
      {errors?.endDate && <p>{errors.endDate.message}</p>}
      <p>Contributors</p>
      <input {...register("contributors")} placeholder="Contributors" />
      {errors?.contributors && <p>{errors.contributors.message}</p>}
      <p>Allow List</p>
      <input {...register("allowList")} placeholder="Allow List" />
      {errors?.allowList && <p>{errors.allowList.message}</p>}
      <p>Distribution To Allow List</p>
      <input {...register("distributionToAllowList")} placeholder="Distribution To Allow List" />
      {errors?.distributionToAllowList && <p>{errors.distributionToAllowList.message}</p>}
      <p>Deduplicate</p>
      <input {...register("deduplicate")} type="checkbox" />
      {errors?.deduplicate && <p>{errors.deduplicate.message}</p>}
      <p>Contributor Permission</p>
      <input {...register("contributorPermission")} type="checkbox" />
      {errors?.contributorPermission && <p>{errors.contributorPermission.message}</p>}
      <p>Hypercert Terms of ServiceC</p>
      <input {...register("hypercertToC")} type="checkbox" />
      {errors?.hypercertToC && <p>{errors.hypercertToC.message}</p>}

      <input type="submit" />
    </form>
  </div>)
}