import React from 'react'
import { useEffect } from "react"
import { useForm, Resolver, FieldErrors } from "react-hook-form"
import { useAccount} from 'wagmi'
import { useRunJob } from './useRunJob'
import { AppContext } from 'src/context/AppContext'
import { useApp } from 'src/hooks/useApp'
import { usePlugin } from 'src/hooks/usePlugin'
import { drawTextNode } from './drawCanvas'
export type RunJobValues = {
        // what is the module name we are making an offer for
        module: string,
        // an array of key=value pairs that will be the inputs to the job
        inputs: string[]
        // the address of the client who is paying for the job
        // they must have called the increaseAllowance function
        // giving the controller (i.e. solver) permission to spend their tokens
        payee: `0x${string}`
}
const resolver: Resolver<RunJobValues> = async (values) => {
    const errors: FieldErrors<RunJobValues> = {};
    const requiredFields = [
        'module',
        'inputs',
        'payee',
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

const getDefaultValues = (app) => {

}


export const RunJobForm = ({handleCloseModal}:
    {handleCloseModal: () => void}
    ) => {
    const app = useApp()
    const plugin = usePlugin()
    
    
    const { fetchRunJob, jobIdHash, jobId, dealId, dataId, module, inputs, payee } = useRunJob()
    const { address, isConnecting, isDisconnected } = useAccount()
    const { setValue, register, handleSubmit, watch, formState: { errors } } = useForm<RunJobValues>({
        resolver,
    });
    const onSubmit = (data: RunJobValues) => {
        fetchRunJob({
            initialModule: data.module,
            initialInputs: data.inputs,
            initialPayee: data.payee
        })
        console.log(data);
    }
    useEffect(() => {
        if (jobIdHash) {
            console.log(jobIdHash)
            console.log('transaction submitted')
            //drawTextNode(app, jobIdHash)
            
            
        }
    }, [jobIdHash])
    useEffect(() => {
        if (jobId) {
            console.log(jobId)
            console.log('job created, awaiting job completion')
        }
    }, [jobId])
    useEffect(() => {
        if (dealId && dataId) {
            console.log('dealId',dealId)
            console.log('dataId',dataId)
            console.log('job completed ')
        }
    }, [dealId, dataId])

    useEffect(() => {
        console.log('module', module)
        console.log('inputs', inputs)
        console.log('payee', payee)

        if (module) setValue('module', module)
        if (inputs) setValue('inputs', inputs)
        if (payee) setValue('payee', payee as `0x${string}`)
    }, [module, inputs, payee])
    return (<div>
        <form onSubmit={handleSubmit(onSubmit)}>
            <label>Module</label>
            <input {...register("module", { required: true })} />
            <label>Inputs</label>
            <input {...register("inputs", { required: true })} />
            <label>payee</label>
            <input {...register("payee", { required: true })} />
            <input type="submit" />
        </form>
    </div>)
}