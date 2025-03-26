'use client';

import { ColoredSection } from "@/components/coloredSection";
import { SpinButton } from "@/components/spinButton";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Select, SelectItem } from "@nextui-org/select";
import React, { useState } from 'react';
import { getVerifyClaimResponse } from '../halloumi/api';
import { createHalloumiPrompt } from '../halloumi/preprocessing';
import { AnalysisBox } from './analysisBox';
import { ClaimBox } from './claimBox';
import { ContextBox } from './contextBox';
import { Citation, ExampleTemplates, Model, VerifyClaimResponse } from './types';
export interface ClaimVerifierProps {
  models: Model[];
  examples: ExampleTemplates[];
}

export default function ClaimVerifier(props: ClaimVerifierProps) {
  const [targetModel, setTargetModel] = useState<string>('');
  const [claimResponse, setClaimResponse] = useState<VerifyClaimResponse | null>(null);
  const [claimInput, setClaimInput] = useState('');
  const [claimContext, setClaimContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [editView, setEditView] = useState(true);
  const [selectedClaimInd, setSelectedClaimInd] = useState<number>(-1);
  const [visibleCitations, setVisibleCitations] = useState<Citation[]>([]);
  const [selectedCitationId, setSelectedCitationId] = useState<string | undefined>(undefined);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExampleTemplates | undefined>(undefined);

  const resetState = () => {
    setClaimResponse(null);
    setSelectedClaimInd(-1)
    setVisibleCitations([]);
    setSelectedCitationId(undefined);
    setShowErrorMessage(false);
  }

  const onModelSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTargetModel(value);
  };

  const onExampleTemplateSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedTemplate = props.examples.find((example) => example.displayName === value);
    if (selectedTemplate !== undefined) {
      setSelectedTemplate(selectedTemplate);
    }
  };

  const updateSelectedClaim = (claimIndex: number) => {
    if (!claimResponse) {
      return;
    }
    setSelectedClaimInd(claimIndex);
    setSelectedCitationId(undefined);
    if (claimIndex < 0) {
      setVisibleCitations([]);
    }
    else {
      setVisibleCitations(claimResponse?.claims[claimIndex].citationIds.map((citationId) => claimResponse?.citations[citationId]) || []);
    }
  }

  const verifyClaims = (input: string, context: string) => {
    const model = props.models.find((model) => model.name === targetModel);
    if (!model) {
      setShowErrorMessage(true);
      return;
    }
    setLoading(true);
    resetState();
    const prompt = createHalloumiPrompt(context, input);
    getVerifyClaimResponse(model, prompt).then((response) => {
      setClaimResponse(response);
      setLoading(false);
      setEditView(false);
      return response;
    }).catch((err) => {
      setLoading(false);
      setShowErrorMessage(true);
    });
  };

  return (
    <ColoredSection
      colorClass="bg-white"
    >
      <div className="grid grid-cols-[repeat(auto-fit,400px)] justify-center container gap-3 font-inria">
        <div className="column-start-1 col-span-1 xl:col-span-2">
          <Popover
            isOpen={showErrorMessage}
            onClose={() => setShowErrorMessage(false)}
            placement="right"
            showArrow={true}
            backdrop="opaque"
          >
            <PopoverTrigger>
              <div className="inline-block">
                <SpinButton
                  className="justify-self-start"
                  onClick={() => editView ? verifyClaims(claimInput, claimContext) : setEditView(true)}
                  text={editView ? "Verify claims" : "Try another claim"}
                  inProgress={loading}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-2 bg-red-500 text-white rounded-md">
                Whoops, that&apos;s an error! Please try again.
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className=" lg:justify-items-end">
          <div className="flex">
            <Select
              className="w-[200px]"
              label="Choose a model"
              isDisabled={!editView || loading}
              defaultSelectedKeys={props.models.length > 0 ? [props.models[0].name] : []}
              onChange={onModelSelection}
              disallowEmptySelection={true}
            >
              {props.models.map((model) => (
                <SelectItem key={model.name}>{model.displayName}</SelectItem>
              ))}
            </Select>
            <Select
              className="w-[250px]"
              label="Try an example"
              isDisabled={!editView || loading}
              defaultSelectedKeys={props.examples.length > 0 ? [props.examples[0].displayName] : []}
              onChange={onExampleTemplateSelection}
              disallowEmptySelection={true}
            >
              {props.examples.map((example) => (
                <SelectItem key={example.displayName}>{example.displayName}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <div className="column-start-1 lg:col-span-2 lg:row-start-2 lg:row-span-3">
          <ContextBox
            className="w-full h-[625px]"
            onTextChange={setClaimContext}
            loading={loading}
            citations={visibleCitations}
            editView={editView}
            visibleCitationId={selectedCitationId}
            templateText={selectedTemplate ? selectedTemplate.context : undefined}
          />
        </div>
        <div>
          <ClaimBox
            className="w-[400px] h-[200px]"
            onTextChange={setClaimInput}
            onClaimClick={updateSelectedClaim}
            selectedClaim={selectedClaimInd}
            loading={loading}
            claims={claimResponse ? claimResponse.claims : []}
            editView={editView}
            templateText={selectedTemplate ? selectedTemplate.claim : undefined}
          />
        </div>
        <div>
          <AnalysisBox
            className="w-[400px] h-[413px]"
            loading={loading}
            claimText={claimInput}
            selectedClaim={selectedClaimInd}
            onClaimClick={updateSelectedClaim}
            onCitationClick={setSelectedCitationId}
            claims={claimResponse ? claimResponse.claims : []}
            editView={editView}
          />
        </div>
      </div>
    </ColoredSection>
  )
}
