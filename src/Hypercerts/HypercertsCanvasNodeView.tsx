import React from "react"
import { Root, createRoot } from "react-dom/client";
import { useForm, Resolver, FieldErrors } from "react-hook-form"
import { useCreateHypercert} from './useHypercerts'
import { App, Modal } from "obsidian"
import { AppContext } from "src/context/AppContext";
import { WagmiConfig } from "wagmi";

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

export const HyperCertsCanvasNodeView = ({nftStorageApiKey}:{nftStorageApiKey: string}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver })
  const {
    createHypercert,
    result: createHypercertResult,
    hash: createHypercertHash,
  } = useCreateHypercert(nftStorageApiKey)
  const onSubmit = handleSubmit((data) => {
    console.log(data)
    createHypercert({
      data
    })

  })


  return (<div style={{display:'flex', width: '100%', height: '100%', overflowY: 'scroll'}}>
    <form onSubmit={onSubmit}>
      <h4>Create Hypercert</h4>
      <p>Hypercert Name:</p>
      <input {...register("hypercertName")} placeholder="Hypercert Name" />
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.hypercertName && <p>{errors.hypercertName.message}</p>}</p>
      <p>Hypercert Details</p>
      <input {...register("logoImageLink")} placeholder="Logo Image Link" />
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.logoImageLink && <p>{errors.logoImageLink.message}</p>}</p>
      <p>Banner Image Link</p>
      <input {...register("backgroundBannerImageLink")} placeholder="Background Banner Image Link" />
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.backgroundBannerImageLink && <p>{errors.backgroundBannerImageLink.message}</p>}</p>
      <p>Description</p>
      <input {...register("description")} placeholder="Description" />
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.description && <p>{errors.description.message}</p>}</p>
      <p>Hypercert Link</p>
      <input {...register("link")} placeholder="Link" />
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.link && <p>{errors.link.message}</p>}</p>
      <p>Work Scope</p>
      <input {...register("workScope")} placeholder="Work Scope" />
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.workScope && <p>{errors.workScope.message}</p>}</p>
      <p>Start Date</p>
      <input {...register("startDate")} placeholder="Start Date" />
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.startDate && <p>{errors.startDate.message}</p>}</p>
      <p>End Date</p>
      <input {...register("endDate")} placeholder="End Date" />
      <p style={{ color: 'red', fontSize: '10px'}}>{errors?.endDate && <p>{errors.endDate.message}</p>}</p>
      <p>Contributors</p>
      <input {...register("contributors")} placeholder="Contributors" />
      <p style={{ color: 'red', fontSize: '10px'}}>{errors?.contributors && <p>{errors.contributors.message}</p>}</p>
      <p>Allow List</p>
      <input {...register("allowList")} placeholder="Allow List" />
      <p style={{ color: 'red', fontSize: '10px'}}>{errors?.allowList && <p>{errors.allowList.message}</p>}</p>
      <p>Distribution To Allow List</p>
      <input {...register("distributionToAllowList")} placeholder="Distribution To Allow List" />
      <p style={{ color: 'red', fontSize: '10px'}}>{errors?.distributionToAllowList && <p>{errors.distributionToAllowList.message}</p>}</p>
      <p>Deduplicate  <input {...register("deduplicate")} type="checkbox" /></p>
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.deduplicate && <p>{errors.deduplicate.message}</p>}</p>
      <p>Contributor Permission  <input {...register("contributorPermission")} type="checkbox" /></p>
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.contributorPermission && <p>{errors.contributorPermission.message}</p>}</p>
      <p>Hypercert Terms of Service <input {...register("hypercertToC")} type="checkbox" /></p>
      <p style={{color: 'red', fontSize: '10px'}}>{errors?.hypercertToC && <p>{errors.hypercertToC.message}</p>}</p>


      <input type="submit" />
    </form>
  </div>)
}

export class HypercertModal extends Modal {
	root: Root | null = null;
  wagmiConfig: any;
  nftStorageApiKey: string;
	constructor(app: App, wagmiConfig: any, nftStorageApiKey: string) {
		super(app);
    console.log(this.app)
    this.wagmiConfig = wagmiConfig
    this.nftStorageApiKey = nftStorageApiKey
	}
	/*	
	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Wallet View";
	}
*/

	async onOpen() {
		let { contentEl } = this;
		//contentEl.setText("Look at me, I'm a modal! 👀");
		this.root = createRoot(contentEl);
		this.root.render(
			<AppContext.Provider value={this.app}>
				<WagmiConfig config={this.wagmiConfig}>
          <HyperCertsCanvasNodeView nftStorageApiKey={this.nftStorageApiKey} />
				</WagmiConfig>
			</AppContext.Provider>,
		);
	}

	async onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}