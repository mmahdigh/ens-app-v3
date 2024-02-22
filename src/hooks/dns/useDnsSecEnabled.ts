import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'

import { CreateQueryKey, QueryConfig } from '@app/types'

import { useQueryOptions } from '../useQueryOptions'

export const DNS_OVER_HTTP_ENDPOINT = 'https://1.1.1.1/dns-query'

type DnsRecord = {
  name: string
  type: number
  TTL: number
  data: string
}

type DnsQuestion = {
  name: string
  type: number
}

type DohResponse = {
  AD: boolean
  Answer: DnsRecord[]
  CD: false
  Question: DnsQuestion[]
  RA: boolean
  RD: boolean
  Status: number
  TC: boolean
}

type UseDnsSecEnabledParameters = {
  name?: string | undefined | null
}

type UseDnsSecEnabledReturnType = boolean

type UseDnsSecEnabledConfig = QueryConfig<UseDnsSecEnabledReturnType, Error>

type QueryKey<TParams extends UseDnsSecEnabledParameters> = CreateQueryKey<
  TParams,
  'getDnsSecEnabled',
  'independent'
>

export const getDnsSecEnabledQueryFn = async <TParams extends UseDnsSecEnabledParameters>({
  queryKey: [{ name }],
}: QueryFunctionContext<QueryKey<TParams>>) => {
  if (!name) throw new Error('name is required')

  const response = await fetch(
    `${DNS_OVER_HTTP_ENDPOINT}?${new URLSearchParams({
      name,
      do: 'true',
    })}`,
    {
      headers: {
        accept: 'application/dns-json',
      },
    },
  )
  const result: DohResponse = await response.json()
  // NXDOMAIN
  if (result?.Status === 3) return false
  return result?.AD
}

export const useDnsSecEnabled = <TParams extends UseDnsSecEnabledParameters>({
  // config
  gcTime = 60,
  enabled = true,
  staleTime,
  scopeKey,

  // params
  ...params
}: TParams & UseDnsSecEnabledConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: 'getDnsSecEnabled',
    queryDependencyType: 'independent',
    queryFn: getDnsSecEnabledQueryFn,
  })

  const preparedOptions = queryOptions({
    queryKey: initialOptions.queryKey,
    queryFn: initialOptions.queryFn,
  })

  const query = useQuery({
    ...preparedOptions,
    enabled: enabled && !!params.name && params.name !== 'eth' && params.name !== '[root]',
    gcTime,
    retry: 2,
    staleTime,
  })

  return {
    ...query,
    isCachedData: query.status === 'success' && query.isFetched && !query.isFetchedAfterMount,
  }
}
